package com.zipenter.aibook;
// Add these required imports:
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.Nullable;

import com.google.android.ump.ConsentDebugSettings;
import com.google.android.ump.ConsentForm;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.FormError;
import com.google.android.ump.UserMessagingPlatform;
import com.zoontek.rnbootsplash.RNBootSplash;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {
  private ConsentInformation consentInformation;
  private ConsentForm consentForm;
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "ai_chat";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
        // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
        );
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    RNBootSplash.init(this); // <- initialize the splash screen
    super.onCreate(null); // or super.onCreate(null) with react-native-screens

//     ConsentDebugSettings debugSettings = new ConsentDebugSettings.Builder(this)
//         .setDebugGeography(ConsentDebugSettings
//             .DebugGeography
//             .DEBUG_GEOGRAPHY_EEA)
//         .addTestDeviceHashedId("87b040ae-7067-43cd-b875-39c876bf2fbc")
//         .build();

    // Set tag for underage of consent. Here false means users are not underage.
      ConsentRequestParameters params = new ConsentRequestParameters
        .Builder()
        .setTagForUnderAgeOfConsent(false)
//         .setConsentDebugSettings(debugSettings)
        .build();

      consentInformation = UserMessagingPlatform.getConsentInformation(this);
      consentInformation.requestConsentInfoUpdate(
        this,
        params,
        new ConsentInformation.OnConsentInfoUpdateSuccessListener() {
          @Override
          public void onConsentInfoUpdateSuccess() {
            // The consent information state was updated.
            // You are now ready to check if a form is available.
            if (consentInformation.isConsentFormAvailable()) {
              loadForm();
            }
          }
        },
        new ConsentInformation.OnConsentInfoUpdateFailureListener() {
          @Override
          public void onConsentInfoUpdateFailure(FormError formError) {
            // Handle the error.
          }
        });
  }
    public void loadForm() {
      UserMessagingPlatform.loadConsentForm(
        this, new UserMessagingPlatform.OnConsentFormLoadSuccessListener() {
          @Override
          public void onConsentFormLoadSuccess(ConsentForm consentForm) {
            MainActivity.this.consentForm = consentForm;
            if (consentInformation.getConsentStatus() == ConsentInformation.ConsentStatus.REQUIRED) {
              consentForm.show(
                MainActivity.this,
                new ConsentForm.OnConsentFormDismissedListener() {
                  @Override
                  public void onConsentFormDismissed(@Nullable FormError formError) {
                    // Handle dismissal by reloading form.
                    loadForm();
                  }
                });
            }
          }
        },
        new UserMessagingPlatform.OnConsentFormLoadFailureListener() {
          @Override
          public void onConsentFormLoadFailure(FormError formError) {
            // Handle the error.
          }
        });
    }

}
