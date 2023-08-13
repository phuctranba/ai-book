import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { useAppDispatch } from "configs/store.config";
import { EnumAnalyticEvent } from "constants/anlytics.constant";
import { GlobalPopupHelper } from "helpers/index";
import { logEventAnalytics, useNativeAds } from "helpers/system.helper";
import NativeAdView, { NativeAdViewProps } from "react-native-admob-native-ads";
import {setStateToImpression} from "store/reducer/system.reducer.store";


interface TypedNativeAdmobProps extends NativeAdViewProps {
  nameAds: string;
}

const NativeAdmob = forwardRef(({
                                  nameAds,
                                  onAdOpened,
                                  onAdLeftApplication,
                                  onAdImpression,
                                  onAdClicked,
                                  onNativeAdLoaded,
                                  onAdFailedToLoad,
                                  onAdLoaded,
                                  onAdClosed,
                                  ...props
                                }: TypedNativeAdmobProps, ref: React.Ref<NativeAdView>) => {
  const dispatch = useAppDispatch();
  const { switchAdsId } = useNativeAds();
  const nativeAdViewRef = useRef<NativeAdView>(null);

  // @ts-ignore
  useImperativeHandle(ref, () => nativeAdViewRef.current, []);

  const onAdFailedToLoadAdmob = (error) => {
    if (error && error?.currencyCode?.toUpperCase() != "USD") {
      logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad + nameAds, {
        code: error?.code,
        message: error?.message,
        currencyCode: error?.currencyCode
      });
      console.log(EnumAnalyticEvent.NativeAdsFailedToLoad + nameAds);
      console.log("Call switchAdsId " + nameAds);
      switchAdsId();
    }
    onAdFailedToLoad?.(error);
  };

  const onNativeAdLoadedAdmob = (data) => {
    logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + nameAds);
    console.log(EnumAnalyticEvent.onNativeAdsLoaded + nameAds);
    onNativeAdLoaded?.(data);
  };

  const onAdClickedAdmob = () => {
    GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
    logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked + nameAds);
    console.log(EnumAnalyticEvent.NativeAdsClicked + nameAds);
    onAdClicked?.();
  };

  const onAdImpressionAdmob = () => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsImpression + nameAds);
    console.log(EnumAnalyticEvent.NativeAdsImpression + nameAds);
    onAdImpression?.();
  };

  const onAdOpenedAdmob = () => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsOpened + nameAds);
    console.log(EnumAnalyticEvent.NativeAdsOpened + nameAds);
    onAdOpened?.();
  };

  const onAdLeftApplicationAdmob = () => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsLeftApplication + nameAds);
    console.log(EnumAnalyticEvent.NativeAdsLeftApplication + nameAds);
    onAdLeftApplication?.();
  };

  const onAdClosedAdmob = () => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsClosed + nameAds);
    console.log(EnumAnalyticEvent.NativeAdsClosed + nameAds);
    onAdClosed?.();
  };

  const onAdLoadedAdmob = () => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsLoaded + nameAds);
    console.log(EnumAnalyticEvent.NativeAdsLoaded + nameAds);
    setTimeout(() => dispatch(setStateToImpression({})), 500);
    onAdLoaded?.();
  };

  return (
    <NativeAdView
      ref={nativeAdViewRef}
      onAdFailedToLoad={onAdFailedToLoadAdmob}
      onAdClicked={onAdClickedAdmob}
      onNativeAdLoaded={onNativeAdLoadedAdmob}
      onAdImpression={onAdImpressionAdmob}
      onAdOpened={onAdOpenedAdmob}
      onAdLeftApplication={onAdLeftApplicationAdmob}
      onAdClosed={onAdClosedAdmob}
      onAdLoaded={onAdLoadedAdmob}
      {...props}
    >
      {props.children}
    </NativeAdView>
  );
});

export default NativeAdmob;
