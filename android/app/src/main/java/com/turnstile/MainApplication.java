package com.turnstile;

import android.app.Application;
import android.content.Context;
import android.util.Log;
import com.BV.LinearGradient.LinearGradientPackage;

import com.evollu.react.fcm.FIRMessagingPackage;
import com.facebook.react.ReactApplication;
//import com.oblador.vectoricons.VectorIconsPackage;
import com.horcrux.svg.SvgPackage;
import com.horcrux.svg.SvgPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.facedetection.RNFaceDetectionPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facedetection.RNFaceDetectionPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.horcrux.svg.SvgPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.github.yamill.orientation.OrientationPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.turnstile.Bridge.DetectorPackage;
import com.github.anrwatchdog.ANRError;
import com.github.anrwatchdog.ANRWatchDog;
import com.isap.debug.LogUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.Arrays;
import java.util.List;


public class MainApplication extends Application implements ReactApplication {

    private static Context context;

    public static Context getAppContext() {
        return MainApplication.context;
    }
    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
           // new VectorIconsPackage(),
            new SvgPackage(),
            new OrientationPackage(),
            new LinearGradientPackage(),
            new RNDeviceInfo(),
            new DetectorPackage(),
            new FIRMessagingPackage(), new RNFaceDetectionPackage(MainActivity.activity)
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };


    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        ANRWatchDog anrWatchDog = new ANRWatchDog(2000);

        if (BuildConfig.DEBUG == false) {
            anrWatchDog = new ANRWatchDog(2000 /*timeout*/);
        }
        else {
            anrWatchDog = new ANRWatchDog().setANRListener(new ANRWatchDog.ANRListener() {
                @Override
                public void onAppNotResponding(ANRError error) {
                    // Some tools like ACRA are serializing the exception, so we must make sure the exception serializes correctly
                    try {
                        new ObjectOutputStream(new ByteArrayOutputStream()).writeObject(error);
                    }
                    catch (IOException ex) {
                        throw new RuntimeException(ex);
                    }

                    Log.i("JC+ WatchDog", "Error was successfully serialized");

                    throw error;
                }
            });
        }

        anrWatchDog.start();
        LogUtils.init(this);

        SoLoader.init(this, /* native exopackage */ false);
        MainApplication.context = getApplicationContext();
    }
}
