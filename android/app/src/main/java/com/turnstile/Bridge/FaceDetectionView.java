package com.turnstile.Bridge;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.graphics.drawable.ColorDrawable;
import android.hardware.Camera;
import android.net.Uri;
import android.support.media.ExifInterface;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.SparseArray;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.RelativeLayout;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.turnstile.MainApplication;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.vision.CameraSource;
import com.google.android.gms.vision.Frame;
import com.google.android.gms.vision.MultiProcessor;
import com.google.android.gms.vision.Tracker;
import com.google.android.gms.vision.face.Face;
import com.google.android.gms.vision.face.FaceDetector;
import com.isap.debug.LogUtils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.sql.Timestamp;

/**
 * Created by Neo on 2018/1/29.
 */

public class FaceDetectionView extends FrameLayout implements CameraSource.PictureCallback {
    private static final String TAG = "FaceTracker";

    private static final String SNAPSHOT_FOLDER = FileUtils.getDiskCacheDir(MainApplication.getAppContext()) + "/snapshot/";

    private static final int RC_HANDLE_GMS = 9001;
    private static final int PREFER_WIDTH = 640;
    private static final int PREFER_HEIGHT = 480;
    private static final long PREFER_CHECK_TIME = 100;
    private static final long PREFER_POPUP_MSG_TIME = 1500;
    private static final float EXPECTED_FPS = 10.0f;

    private CameraSource mCameraSource = null;
    private com.turnstile.Bridge.uicamera.CameraSourcePreview mPreview;
    private com.turnstile.Bridge.uicamera.GraphicOverlay mGraphicOverlay;

    private static int mCurrentCameraId = Camera.CameraInfo.CAMERA_FACING_FRONT;

    private FaceDetector mDetector;

    private Context mContext;
    private Activity mActivity;
    private long mLastUpdateTime = 0;
    private boolean mSaveDetectedInFile = false;
    private boolean mShowDebugInfo = false;

    private Object mLocker = new Object();


    public void sentNativeEvent(WritableMap event, String caller)
    {
        event.putString("caller", caller);
        ReactContext reactContext = (ReactContext)getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "onNativeCallback",
                event);
    }

    public FaceDetectionView(ThemedReactContext context) {
        super(context);

        mContext = context;
        mActivity = context.getCurrentActivity();
        mPreview = new com.turnstile.Bridge.uicamera.CameraSourcePreview(context);
        mGraphicOverlay = new com.turnstile.Bridge.uicamera.GraphicOverlay(context);
        mPreview.addView(mGraphicOverlay);
        addView(mPreview);
    }

    public void startCameraSource() {
        synchronized (mLocker) {
            if (mCameraSource != null)
                return;

LogUtils.d("start checking Google Play Services");
            // check that the device has play services available.
            int code = GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(
                    mContext);
            if (code != ConnectionResult.SUCCESS) {
                LogUtils.d("Google Play Services is not available.");
                DialogInterface.OnClickListener listener = new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {

                    }
                };
                AlertDialog.Builder builder = new AlertDialog.Builder(mActivity);
                builder.setTitle("Face Tracker sample")
                        .setMessage("Google Play Service is not available.")
                        .setPositiveButton("OK", listener)
                        .show();
                return;
            }
            LogUtils.d("Google Play Services is OK");
            createCameraSource();

            if (mCameraSource != null) {
                try {
                    mPreview.start(mCameraSource, mGraphicOverlay);
                } catch (IOException e) {
                    Log.e("", "Unable to start camera source.", e);
                    mCameraSource.release();
                    mCameraSource = null;
                }
            }
        }
    }

    public void stopCameraSource() {
        synchronized (mLocker) {
            if (mCameraSource == null)
                return;

            if (mPreview != null) {
                mPreview.stop();
//            mPreview.release();
            }
            if (mCameraSource != null) {
                mCameraSource.stop();
                mCameraSource.release();
            }
//        mPreview = null;
            mCameraSource = null;
        }
    }

    public void setCameraFacing(int facingFront) {

        if (facingFront == mCurrentCameraId)
            return;

        synchronized (mLocker) {
            mPreview.stop();
            mCameraSource.stop();
            mCameraSource.release();
            mCameraSource = null;

            if (mCurrentCameraId == Camera.CameraInfo.CAMERA_FACING_BACK)
                mCurrentCameraId = Camera.CameraInfo.CAMERA_FACING_FRONT;
            else
                mCurrentCameraId = Camera.CameraInfo.CAMERA_FACING_BACK;

            startCameraSource();
        }
    }

    public void EnableDebugInfo(boolean enable) {
        mShowDebugInfo = enable;
    }

    private void prepareDetector() {
        mDetector = new FaceDetector.Builder(mContext)
                .setLandmarkType(FaceDetector.ALL_LANDMARKS)
                .setClassificationType(FaceDetector.ALL_CLASSIFICATIONS)
                .setTrackingEnabled(true)
                .setMode(FaceDetector.FAST_MODE)
                .setProminentFaceOnly(true)
                .setMinFaceSize((mCurrentCameraId == Camera.CameraInfo.CAMERA_FACING_FRONT) ? 0.35f : 0.15f)
                .build();

        mDetector.setProcessor(
                new MultiProcessor.Builder<>(new GraphicFaceTrackerFactory())
                        .build());

        if (!mDetector.isOperational()) {
            Log.w(TAG, "Face detector dependencies are not yet available.");
        }
    }

    private void createCameraSource() {
        prepareDetector();
        mCameraSource = new CameraSource.Builder(mContext, mDetector)
                .setRequestedPreviewSize(PREFER_WIDTH, PREFER_HEIGHT)
                .setFacing(mCurrentCameraId)
                .setRequestedFps(EXPECTED_FPS)
                .build();

    }

    private class GraphicFaceTrackerFactory implements MultiProcessor.Factory<Face> {
        @Override
        public Tracker<Face> create(Face face) {
            return new GraphicFaceTracker(mGraphicOverlay);
        }
    }

    private class GraphicFaceTracker extends Tracker<Face> {
        private com.turnstile.Bridge.uicamera.GraphicOverlay mOverlay;
        private FaceGraphic mFaceGraphic;

        GraphicFaceTracker(com.turnstile.Bridge.uicamera.GraphicOverlay overlay) {
            mOverlay = overlay;
            mFaceGraphic = new FaceGraphic(overlay);
        }



        /**
         * Start tracking the detected face instance within the face overlay.
         */
        @Override
        public void onNewItem(int faceId, Face item) {
            mFaceGraphic.setId(faceId);
            LogUtils.d("A new face is coming " + item.getId());
//            mCameraSource.takePicture(null, LoginActivity.this);
        }

        /**
         * Update the position/characteristics of the face within the overlay.
         */
        @Override
        public void onUpdate(FaceDetector.Detections<Face> detectionResults, Face face) {
            mOverlay.add(mFaceGraphic);
            if (mShowDebugInfo)
                mFaceGraphic.updateFace(face);

            if ((System.currentTimeMillis()-mLastUpdateTime) > PREFER_CHECK_TIME) {
                if (mCameraSource != null && mOverlay.count() > 0) {
                    mCameraSource.takePicture(null, FaceDetectionView.this);
                    mLastUpdateTime = System.currentTimeMillis();
                }
            }
        }

        /**
         * Hide the graphic when the corresponding face was not detected.  This can happen for
         * intermediate frames temporarily (e.g., if the face was momentarily blocked from
         * view).
         */
        @Override
        public void onMissing(FaceDetector.Detections<Face> detectionResults) {
            mOverlay.remove(mFaceGraphic);
        }

        /**
         * Called when the face is assumed to be gone for good. Remove the graphic annotation from
         * the overlay.
         */
        @Override
        public void onDone() {
            mOverlay.remove(mFaceGraphic);
        }
    }

    private Bitmap cutWhatINeed(Bitmap src, int x, int y, int width, int height) {
        Bitmap cutBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);
        Canvas canvas = new Canvas(cutBitmap);
        Rect srcRect = new Rect(x, y, x+width, y+height);
        Rect dstRect = new Rect(0, 0, width, height);
        canvas.drawBitmap(src, srcRect, dstRect, null);

        return cutBitmap;
    }

    private boolean NotifyOriginalImage(Bitmap bmp) {
        boolean ret = false;

        if (mSaveDetectedInFile) {

        }
        else {
            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            bmp.compress(Bitmap.CompressFormat.JPEG, 100, stream);
            byte[] byteArray = stream.toByteArray();

            WritableMap event2 = Arguments.createMap();
            event2.putString("image2", Base64.encodeToString(byteArray, Base64.DEFAULT));
            sentNativeEvent(event2, "FaceDetected");
            ret = true;
        }

        return ret;
    }

    private boolean NotifyFaceDetected(Bitmap bmp) {
        boolean ret = false;
        LogUtils.d("timeTest NotifyFaceDetected start");

        if (mSaveDetectedInFile) {
            try {
                File filePath = new File(SNAPSHOT_FOLDER);
                if (!filePath.exists()) {
                    filePath.mkdir();
                }
                java.util.Date date = new java.util.Date();
                String fileName = new Timestamp(date.getTime()).toString();
                fileName = fileName.replace(":", "").replace("-", "").replace(" ", "").replace(".", "") + ".jpg";
                File file = new File(SNAPSHOT_FOLDER, fileName);

                FileOutputStream stream = new FileOutputStream(file);
                bmp.compress(android.graphics.Bitmap.CompressFormat.JPEG, 100, stream);
                stream.flush();
                stream.close();
                stream = null;

                Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(file));
                mContext.sendBroadcast(mediaScanIntent);

                WritableMap event = Arguments.createMap();
                event.putString("uri", SNAPSHOT_FOLDER + "/" + fileName);
                sentNativeEvent(event, "FaceDetected");

                ret = true;
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        else {
            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            bmp.compress(Bitmap.CompressFormat.JPEG, 100, stream);
            byte[] byteArray = stream.toByteArray();

            WritableMap event2 = Arguments.createMap();
            event2.putString("image", Base64.encodeToString(byteArray, Base64.DEFAULT));
            sentNativeEvent(event2, "FaceDetected");
            ret = true;
        }
        LogUtils.d("timeTest NotifyFaceDetected end");

        return ret;
    }

    private void popupImage(Bitmap bmp) {
        final Dialog builder = new Dialog(mActivity);
        builder.requestWindowFeature(Window.FEATURE_NO_TITLE);
        builder.getWindow().setBackgroundDrawable(
                new ColorDrawable(android.graphics.Color.TRANSPARENT));
        builder.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override
            public void onDismiss(DialogInterface dialogInterface) {
                //nothing;
            }
        });

        // Get screen width and height in pixels
        DisplayMetrics displayMetrics = new DisplayMetrics();
        mActivity.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        // The absolute width of the available display size in pixels.
        int displayWidth = displayMetrics.widthPixels;
        // The absolute height of the available display size in pixels.
        int displayHeight = displayMetrics.heightPixels;

        // Initialize a new window manager layout parameters
        WindowManager.LayoutParams layoutParams = new WindowManager.LayoutParams();

        // Copy the alert dialog window attributes to new layout parameter instance
        layoutParams.copyFrom(builder.getWindow().getAttributes());

        // Set the alert dialog window width and height
        // Set alert dialog width equal to screen width 90%
        // int dialogWindowWidth = (int) (displayWidth * 0.9f);
        // Set alert dialog height equal to screen height 90%
        // int dialogWindowHeight = (int) (displayHeight * 0.9f);

        float dialogWindowSize = ((displayWidth > displayHeight)? displayHeight : displayWidth) * 0.7f;


        // Set alert dialog width equal to screen width 70%
        int dialogWindowWidth = (int) (dialogWindowSize * 0.7f);
        // Set alert dialog height equal to screen height 70%
        int dialogWindowHeight = (int) (dialogWindowSize * 0.7f);

        // Set the width and height for the layout parameters
        // This will bet the width and height of alert dialog
        layoutParams.width = dialogWindowWidth;
        layoutParams.height = dialogWindowHeight;

        // Apply the newly created layout parameters to the alert dialog window
        builder.getWindow().setAttributes(layoutParams);

        Bitmap bmp2 = Bitmap.createScaledBitmap(bmp, dialogWindowWidth, dialogWindowHeight, true);

        ImageView imgView = new ImageView(mActivity);
        imgView.setImageBitmap(bmp2);
        imgView.setScaleType(ImageView.ScaleType.CENTER_CROP);
        builder.addContentView(imgView, new RelativeLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        builder.show();
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(PREFER_POPUP_MSG_TIME);
                    builder.dismiss();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    @Override
    public void onPictureTaken(byte[] bytes) {
        LogUtils.d("timeTest onPictureTaken start");

        int rotationDegrees = 0;
        int flipPos = 0;
        /// Val 2) no need to detect orientation for now. 0.3 seconds
//        try
//        {
//            ExifInterface exifInterface = new ExifInterface(new ByteArrayInputStream(bytes));
//            int orientation = exifInterface.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
//
//            switch (orientation) {
//                case ExifInterface.ORIENTATION_UNDEFINED:
//                    break;
//                case ExifInterface.ORIENTATION_NORMAL:
//                    break;
//                case ExifInterface.ORIENTATION_FLIP_HORIZONTAL:
//                    flipPos = ExifInterface.ORIENTATION_FLIP_HORIZONTAL;
//                    break;
//                case ExifInterface.ORIENTATION_ROTATE_180:
//                    rotationDegrees = 180;
//                    break;
//                case ExifInterface.ORIENTATION_FLIP_VERTICAL:
//                    flipPos = ExifInterface.ORIENTATION_FLIP_VERTICAL;
//                    break;
//                case ExifInterface.ORIENTATION_TRANSPOSE:
//                    flipPos = ExifInterface.ORIENTATION_FLIP_HORIZONTAL;
//                    break;
//                case ExifInterface.ORIENTATION_ROTATE_90:
//                    rotationDegrees = 90;
//                    break;
//                case ExifInterface.ORIENTATION_TRANSVERSE:
//                    flipPos = ExifInterface.ORIENTATION_FLIP_VERTICAL;
//                    break;
//                case ExifInterface.ORIENTATION_ROTATE_270:
//                    rotationDegrees = 270;
//                    break;
//            }
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
        LogUtils.d("timeTest 1");

        synchronized (mLocker) {
            // Val 1) 0.4 seconds faster
//            if (mCurrentCameraId == Camera.CameraInfo.CAMERA_FACING_FRONT)
//                stopCameraSource();

            /// Val 3) 0.05 seconds faster
//            int mDisplayRotation = Util.getDisplayRotation(mActivity);
//            int mDisplayOrientation = Util.getDisplayOrientation(mDisplayRotation, mCurrentCameraId);
            int mDisplayOrientation = rotationDegrees;
            /// Val: cost 0.16 seconds
            Bitmap tmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
            if (tmp != null) {

                // before detect, I would like to see what it looks like.
                if (false)
                {
                    int w = tmp.getWidth();
                    int h = tmp.getHeight();

                    int scaleSize = 0;
                    while (w>>(scaleSize+1) > 480) {
                        scaleSize++;
                    }

                    if (scaleSize > 0) {
                        w = w>>scaleSize;
                        h = h>>scaleSize;
                        tmp = scaleImage(tmp, w, h);
                    }

                    NotifyOriginalImage(tmp);
                }



                FaceDetector detector = new FaceDetector.Builder(mContext)
                        .setTrackingEnabled(false)
                        .setProminentFaceOnly(true)
                        .setLandmarkType(FaceDetector.ALL_LANDMARKS)
                        .setClassificationType(FaceDetector.ALL_CLASSIFICATIONS)
                        .setMinFaceSize((mCurrentCameraId == Camera.CameraInfo.CAMERA_FACING_FRONT) ? 0.35f : 0.15f)
//                        .setMode(FaceDetector.ACCURATE_MODE) // or FAST_MODE
                        .build();
                LogUtils.d("timeTest 1.3");

                int w = tmp.getWidth();
                int h = tmp.getHeight();

                int scaleSize = 0;
                while (w>>(scaleSize+1) > 480) {
                    scaleSize++;
                }

                if (scaleSize > 0) {
                    w = w>>scaleSize;
                    h = h>>scaleSize;
                    tmp = scaleImage(tmp, w, h);
                }

                LogUtils.d("timeTest 2");
                Bitmap cameraBitmap = null;
//                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
//                    cameraBitmap = Bitmap.createBitmap(tmp, 0, 0, w, h);
//                }
//                else
                    {
                    Matrix mtx = new Matrix();
//                    if (mCurrentCameraId == Camera.CameraInfo.CAMERA_FACING_BACK)

                        mtx.postRotate( mDisplayOrientation );

                        if (flipPos == ExifInterface.ORIENTATION_FLIP_HORIZONTAL)
                            mtx.postScale(-1, 1);
                        else if (flipPos == ExifInterface.ORIENTATION_FLIP_VERTICAL)
                            mtx.postScale(1, -1);

//                    else
//                        mtx.postRotate( -mDisplayOrientation );
                    cameraBitmap = Bitmap.createBitmap(tmp, 0, 0, w, h, mtx, true);
                }

//                saveBmpToStorage(cameraBitmap);
                Frame frame = new Frame.Builder().setBitmap(cameraBitmap).build();
                SparseArray<Face> faces = detector.detect(frame);

                LogUtils.d("timeTest 3");
                for (int i=0; i<faces.size(); i++) {
                    Face face = faces.valueAt(i);

                    if (face.getIsLeftEyeOpenProbability() < 0.3f || face.getIsRightEyeOpenProbability() < 0.3f)
                        continue;

                    Bitmap cutBmp = cutWhatINeed(cameraBitmap,
                            (int) face.getPosition().x,
                            (int) face.getPosition().y,
                            (int) face.getWidth(),
                            (int) face.getHeight());
                    if (cutBmp != null) {
                        // Only save first detect face
//                        if (i == 0) {
                        LogUtils.d("timeTest onPictureTaken end");

                        NotifyFaceDetected(cutBmp);
                        break;
//                        }
                    }

//                    // Only popup first detect face
//                    if (i == 0)
//                        popupImage(cutBmp);
                }
            }

            if (mCurrentCameraId == Camera.CameraInfo.CAMERA_FACING_FRONT)
                startCameraSource();
        }
    }

    public static Bitmap scaleImage(Bitmap bitmap, int newWidth, int newHeight) {
        if (bitmap == null) {
            return null;
        }
        float scaleWidth = (float) newWidth / bitmap.getWidth();
        float scaleHeight = (float) newHeight / bitmap.getHeight();
        Matrix matrix = new Matrix();
        matrix.postScale(scaleWidth, scaleHeight);
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
    }
}
