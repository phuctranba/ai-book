import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Platform } from "react-native"
import { AdEventType, RewardedAdEventType, RewardedInterstitialAd, TestIds, useRewardedInterstitialAd } from 'react-native-google-mobile-ads';

const KEY_REWARD_INTERSTITIAL_ADS_MOB = Platform.select({
  android: "ca-app-pub-9764638132493814/7300553678",
  ios: "ca-app-pub-9764638132493814/7123378130",
}) || ""

const adUnitId = __DEV__
  ? TestIds.REWARDED_INTERSTITIAL
  : KEY_REWARD_INTERSTITIAL_ADS_MOB;

export interface TypedAdsInterstitialRef {
  showAds: (cb: Function) => void
}

const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

const AdsRewardInitialComponent = (_, ref: React.Ref<TypedAdsInterstitialRef>) => {
  const [loaded, setLoaded] = useState(false);
  const callback = useRef<any>();
  const adsDone = useRef<boolean>(false)

  const { } = useRewardedInterstitialAd(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  })

  useEffect(() => {
    const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        callback.current = undefined;
        adsDone.current = false
        setLoaded(true)
      },
    );

    const unsubscribeEarned = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        adsDone.current = true
        console.log('User earned reward of ', reward);
      },
    );

    const closeEarned = rewardedInterstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        if (adsDone.current) {
          callback.current?.();
          rewardedInterstitial.load();
          return
        }
        callback.current?.();
        rewardedInterstitial.load();
      },
    );

    // Start loading the interstitial straight away
    rewardedInterstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      closeEarned();
    }
  }, []);

  useImperativeHandle(ref, () => ({
    showAds: (cb) => {
      try {
        callback.current = cb
        if (loaded) {
          rewardedInterstitial.show()
        } else {
          callback.current = undefined
          cb?.()
        }
      } catch (error) {
        callback.current = undefined;
        cb()
      }
    }
  }), [loaded])

  return null
}

export default forwardRef(AdsRewardInitialComponent);