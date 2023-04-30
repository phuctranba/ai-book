import { useDisplayAds } from 'helpers/system.helper';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { AppState } from 'react-native';
import AppLovinMAX from "react-native-applovin-max";

const OpenAppApplovin = (_, ref) => {
  const canShowOpenAdmob = useRef(true)
  const { key_open_ads_applovin } = useDisplayAds();
  const appState = useRef(AppState.currentState);


  useEffect(() => {
    AppLovinMAX.addAppOpenAdLoadedEventListener((adInfo) => {
      console.log("Ads load from", adInfo);
    });
    AppLovinMAX.addAppOpenAdLoadFailedEventListener((errorInfo) => {
      console.log("Ads load failed from", errorInfo);
    });
    AppLovinMAX.addAppOpenAdClickedEventListener((adInfo) => {
      console.log("Ads clicked from", adInfo);
    });
    AppLovinMAX.addAppOpenAdDisplayedEventListener((adInfo) => {
      console.log("Ads displayed from", adInfo);
    });
    AppLovinMAX.addAppOpenAdFailedToDisplayEventListener((adInfo) => {
      console.log("Ads display failed from", adInfo);
      AppLovinMAX.loadAppOpenAd(key_open_ads_applovin);
    });
    AppLovinMAX.addAppOpenAdHiddenEventListener((adInfo) => {
      AppLovinMAX.loadAppOpenAd(key_open_ads_applovin);
    });
    AppLovinMAX.addAppOpenAdRevenuePaidListener((adInfo) => { });

    AppLovinMAX.loadAppOpenAd(key_open_ads_applovin);
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        showAdIfReady();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };

  }, [key_open_ads_applovin]);

  useImperativeHandle(ref, () => ({
    setIgnoreOneTimeAppOpenAd: () => {
      canShowOpenAdmob.current = false
    },
  }),
    [key_open_ads_applovin]
  );

  const showAdIfReady = async () => {
    try {
      const isAppOpenAdReady = await AppLovinMAX.isAppOpenAdReady(key_open_ads_applovin);
      console.log("isAppOpenAdReady", isAppOpenAdReady);
      
      if (!isAppOpenAdReady) {
        AppLovinMAX.loadAppOpenAd(key_open_ads_applovin);
        return
      }
      if (canShowOpenAdmob.current) {
        AppLovinMAX.showAppOpenAd(key_open_ads_applovin);
        return
      }
      canShowOpenAdmob.current = true
    } catch (error) {
      console.log("error", error);
      
      // Handle error
    }
  }

  return null
}

export default forwardRef(OpenAppApplovin);