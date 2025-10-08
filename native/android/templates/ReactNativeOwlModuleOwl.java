package com.formidable.reactnativeowl;

import android.app.Activity;
import android.view.View;
import android.view.Window;

import androidx.annotation.NonNull;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = ReactNativeOwlModule.NAME)
public class ReactNativeOwlModule extends ReactContextBaseJavaModule {
    public static final String NAME = "ReactNativeOwl";

    public ReactNativeOwlModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public void initialize() {
        hideNavigationBar();
    }

    private void hideNavigationBar() {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                final Activity activity = getCurrentActivity();
                if (activity == null) {
                    return;
                }

                final Window window = activity.getWindow();
                if (window == null) {
                    return;
                }

                final View decorView = window.getDecorView();
                if (decorView == null) {
                    return;
                }

                WindowCompat.setDecorFitsSystemWindows(window, false);

                final WindowInsetsControllerCompat controller =
                        WindowCompat.getInsetsController(window, decorView);
                if (controller == null) {
                    return;
                }

                controller.hide(WindowInsetsCompat.Type.systemBars());
                controller.setSystemBarsBehavior(
                        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        });
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }
}
