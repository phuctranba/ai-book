import { EnumAnalyticEvent } from 'constants/anlytics.constant';
import { GlobalPopupHelper } from "helpers/index";
import { logEventAnalytics, useDisplayAds } from 'helpers/system.helper';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import mobileAds, {MaxAdContentRating, useRewardedAd} from 'react-native-google-mobile-ads';
import {switchAdsId} from "store/reducer/system.reducer.store";
import {useAppDispatch} from "configs/store.config";

export interface TypedAdsRef {
  showAds: (cb: Function) => void
}

const AdsRewardAdmobComponent = (_, ref: React.Ref<TypedAdsRef>) => {
  const callback = useRef<any>();
  const adsDone = useRef<boolean>(false);
  const { rewardAdsId } = useDisplayAds()
  const appState = useRef(AppState.currentState);
  const needShowAds = useRef(false)
  const [isReadyToLoadAdmob, setIsReadyToLoadAdmob] = useState(false)
  const dispatch = useAppDispatch()

  const rewardedAds = useRewardedAd(rewardAdsId, {
    requestNonPersonalizedAdsOnly: true,
  })
  const canShowAds = useRef(true)
  const timeoutOpenRewardedAds = useRef<NodeJS.Timer>()

  //Hàm này siêu cần cho ads
  useEffect(() => {
    mobileAds()
        .setRequestConfiguration({
          // Update all future requests suitable for parental guidance
          maxAdContentRating: MaxAdContentRating.PG,

          // Indicates that you want your content treated as child-directed for purposes of COPPA.
          tagForChildDirectedTreatment: true,

          // Indicates that you want the ad request to be handled in a
          // manner suitable for users under the age of consent.
          tagForUnderAgeOfConsent: true
        })
        .then(() => {
          mobileAds()
              .initialize()
              .then(adapterStatuses => {
                setIsReadyToLoadAdmob(true);
              })
              .catch((error: any) => {
                console.log(error);
              });
        })
        .catch((error: any) => {
          console.log(error);
        });

  }, []);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      canShowAds.current = true
      if (rewardedAds.isLoaded && needShowAds.current) {
        timeoutOpenRewardedAds.current = setTimeout(() => {
          try {
            console.log("show2");
            rewardedAds.show()
          } catch (error) {
            console.log("error 2");
          }
        }, 300);
      }
    }

    if (
        nextAppState.match(/inactive|background/) &&
        appState.current === 'active'
    ) {
      canShowAds.current = false
      clearTimeout(timeoutOpenRewardedAds.current)
    }

    appState.current = nextAppState;
  }, [rewardedAds]);

  useEffect(() => {
    if(isReadyToLoadAdmob){
      if (rewardedAds.isLoaded) {
        adsDone.current = false
        if (needShowAds.current) {
          clearTimeout(timeoutOpenRewardedAds.current)
          timeoutOpenRewardedAds.current = setTimeout(() => {
            if (canShowAds.current) {
              try {
                console.log("show1");
                rewardedAds.show()
              } catch (error) {
                console.log("error 1");
              }
            }
          }, 0);
        }
      } else {
          console.log("call load")
          rewardedAds.load()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [rewardedAds.isLoaded, rewardedAds.load, isReadyToLoadAdmob])

  useEffect(() => {
    if (rewardedAds.isEarnedReward) {
      adsDone.current = true
    }
  }, [rewardedAds.isEarnedReward])

  useEffect(() => {
    needShowAds.current = false
    if (adsDone.current && rewardedAds.isClosed) {
      callback.current?.()
    }
  }, [rewardedAds.isClosed])

  useEffect(() => {
    if (rewardedAds.isAdImpression) {
      logEventAnalytics(EnumAnalyticEvent.RewardAdsImpression)
      console.log(EnumAnalyticEvent.RewardAdsImpression)
    }
  }, [rewardedAds.isAdImpression])

  useEffect(() => {
    if (rewardedAds.error && !rewardedAds.showFail) {
      console.log("Call switchAdsId reward")
      dispatch(switchAdsId("reward"))
      logEventAnalytics(EnumAnalyticEvent.RewardAdsLoadFail,{
        code: rewardedAds.error?.code,
        message: rewardedAds.error?.message
      })
      console.log(EnumAnalyticEvent.RewardAdsLoadFail)
    }
    if (rewardedAds.error && rewardedAds.showFail) {
      logEventAnalytics(EnumAnalyticEvent.RewardAdsShowFail,{
        code: rewardedAds.error?.code,
        message: rewardedAds.error?.message
      })
      console.log(EnumAnalyticEvent.RewardAdsShowFail)
    }
  }, [rewardedAds.error, rewardedAds.showFail])

  useImperativeHandle(ref, () => ({
    showAds: (cb) => {
      callback.current = cb
      GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
      console.log("show reward ads", rewardedAds.isLoaded);

      if (rewardedAds.isLoaded) {
        rewardedAds.show()
      } else {
        needShowAds.current = true
        console.log("call load 3")
        rewardedAds.load()
      }
    }
  }), [rewardedAds])

  return null
}

export default forwardRef(AdsRewardAdmobComponent);
