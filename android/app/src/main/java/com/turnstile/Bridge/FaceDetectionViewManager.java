package com.turnstile.Bridge;

import android.hardware.Camera;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.drawee.controller.AbstractDraweeControllerBuilder;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;

/**
 * Created by Neo on 2018/1/29.
 */

public class FaceDetectionViewManager extends SimpleViewManager<FaceDetectionView> {

    public static final String REACT_CLASS = "FaceDetectionView";

    private static ThemedReactContext reactContext;

    @Override
    public @Nullable
    Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                "what", 1
        );
    }

    public void receiveCommand(FaceDetectionView cv, int commandId, @Nullable ReadableArray args) {
        if (args.size() >= 1) {
            String funcName = args.getString(0);
            try {
                Method method = this.getClass().getDeclaredMethod(funcName, new Class[]{FaceDetectionView.class, ReadableArray.class});
                method.invoke(this, new Object[]{cv, args});
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public @Nullable Map getExportedCustomDirectEventTypeConstants(){
        return MapBuilder.of(
                "onNativeCallback",
                MapBuilder.of("registrationName", "onNativeCallback")
        );
    }

    public void Start(FaceDetectionView cv, ReadableArray args) {
        Log.e("tetxtxe","StartCamera");
        cv.startCameraSource();
    }

    public void Stop(FaceDetectionView cv, ReadableArray args) {
        cv.stopCameraSource();
    }

    public void SetFacingFront(FaceDetectionView cv, ReadableArray args) {
        cv.setCameraFacing(args.getBoolean(1)? Camera.CameraInfo.CAMERA_FACING_FRONT:Camera.CameraInfo.CAMERA_FACING_BACK);
    }

    public void EnableDebugInfo(FaceDetectionView cv, ReadableArray args) {
        cv.EnableDebugInfo(args.getBoolean(1));
    }


    private @Nullable
    AbstractDraweeControllerBuilder mDraweeControllerBuilder;
    private final @Nullable Object mCallerContext;

    public FaceDetectionViewManager() {
        mDraweeControllerBuilder = null;
        mCallerContext = null;
    }

    public FaceDetectionViewManager(
            AbstractDraweeControllerBuilder draweeControllerBuilder,
            Object callerContext) {
        mDraweeControllerBuilder = draweeControllerBuilder;
        mCallerContext = callerContext;
    }



    public AbstractDraweeControllerBuilder getDraweeControllerBuilder() {
        return mDraweeControllerBuilder;
    }

    public Object getCallerContext() {
        return mCallerContext;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected FaceDetectionView createViewInstance(ThemedReactContext reactContext) {
        FaceDetectionViewManager.reactContext = reactContext;

        FaceDetectionView cv = new FaceDetectionView(reactContext);


        return cv;
    }


}
