import { useAppSelector } from "configs/store.config";
import { GlobalPopupHelper } from "helpers/index";
import { useDisplayAds } from 'helpers/system.helper';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import AppLovinMAX from "react-native-applovin-max";

export interface TypedAdsRef {
  showAds: (cb: Function) => void
}

const AdsRewardLovinComponent = (_, ref: React.Ref<TypedAdsRef>) => {
  const callback = useRef<any>();
  const adsDone = useRef<boolean>(false);
  const { isPremium } = useAppSelector(state => state.system)
  const { key_reward_ads_applovin } = useDisplayAds()
  const [rewardedAdRetryAttempt, setRewardedAdRetryAttempt] = useState(0);

  useEffect(() => {
    if (!isPremium) {
      AppLovinMAX.isRewardedAdReady(key_reward_ads_applovin).then(isRewardedAdReady => {
        if (!isRewardedAdReady) {
          AppLovinMAX.loadRewardedAd(key_reward_ads_applovin);
        }
      }).catch(error => {

      })
      AppLovinMAX.addRewardedAdLoadedEventListener((adInfo) => {
        // Rewarded ad is ready to be shown. AppLovinMAX.isRewardedAdReady(REWARDED_AD_UNIT_ID) will now return 'true'
        console.log('Rewarded ad loaded from ' + adInfo.networkName);
        setTimeout(() => {
          AppLovinMAX.showRewardedAd(key_reward_ads_applovin);
        }, 500);
        adsDone.current = false;
        // Reset retry attempt
        setRewardedAdRetryAttempt(0);
      });
      AppLovinMAX.addRewardedAdLoadFailedEventListener((errorInfo) => {
        // Rewarded ad failed to load
        // We recommend retrying with exponentially higher delays up to a maximum delay (in this case 64 seconds)
        setRewardedAdRetryAttempt(rewardedAdRetryAttempt + 1);

        let retryDelay = Math.pow(2, Math.min(6, rewardedAdRetryAttempt));
        console.log('Rewarded ad failed to load with code ' + errorInfo.code + ' - retrying in ' + retryDelay + 's');

        setTimeout(() => {
          AppLovinMAX.loadRewardedAd(key_reward_ads_applovin);
        }, retryDelay * 1000);
      });
      AppLovinMAX.addRewardedAdClickedEventListener((adInfo) => {
        console.log("Rewarded ad clicked");

      });
      AppLovinMAX.addRewardedAdDisplayedEventListener((adInfo) => {
        console.log("Rewarded ad displayed");
      });
      AppLovinMAX.addRewardedAdFailedToDisplayEventListener((adInfo) => {
        console.log("Rewarded ad failed to display");
      });
      AppLovinMAX.addRewardedAdHiddenEventListener((adInfo) => {
        console.log("Rewarded ad hidden");
        if (adsDone.current) {
          callback.current?.()
        }
      });
      AppLovinMAX.addRewardedAdReceivedRewardEventListener((adInfo) => {
        console.log("Rewarded ad granted reward");
        adsDone.current = true
      });
      AppLovinMAX.addRewardedAdRevenuePaidListener((adInfo) => {
        console.log('Rewarded ad revenue paid: ' + adInfo.revenue);
      });
    }
  }, [key_reward_ads_applovin, rewardedAdRetryAttempt]);

  useImperativeHandle(ref, () => ({
    showAds: (cb) => {
      callback.current = cb
      GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
      AppLovinMAX.loadRewardedAd(key_reward_ads_applovin);
    }
  }), [])

  return null
}

export default forwardRef(AdsRewardLovinComponent);
