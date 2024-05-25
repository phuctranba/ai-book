import React, {forwardRef} from "react";


interface TypedNativeAdmobProps extends NativeAdViewProps {
  nameAds: string;
}

const NativeAdmob = forwardRef((_, ref: React.Ref<NativeAdView>) => {
  // const dispatch = useAppDispatch();
  // const { switchAdsId } = useNativeAds();
  // const nativeAdViewRef = useRef<NativeAdView>(null);
  //
  // // @ts-ignore
  // useImperativeHandle(ref, () => nativeAdViewRef.current, []);
  //
  // const onAdFailedToLoadAdmob = (error) => {
  //   if (error && error?.currencyCode?.toUpperCase() != "USD") {
  //     logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad + nameAds, {
  //       code: error?.code,
  //       message: error?.message,
  //       currencyCode: error?.currencyCode
  //     });
  //     console.log(EnumAnalyticEvent.NativeAdsFailedToLoad + nameAds);
  //     console.log("Call switchAdsId " + nameAds);
  //     switchAdsId();
  //   }
  //   onAdFailedToLoad?.(error);
  // };
  //
  // const onNativeAdLoadedAdmob = (data) => {
  //   logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + nameAds);
  //   console.log(EnumAnalyticEvent.onNativeAdsLoaded + nameAds);
  //   onNativeAdLoaded?.(data);
  // };
  //
  // const onAdClickedAdmob = () => {
  //   GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
  //   logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked + nameAds);
  //   console.log(EnumAnalyticEvent.NativeAdsClicked + nameAds);
  //   onAdClicked?.();
  // };
  //
  // const onAdImpressionAdmob = () => {
  //   logEventAnalytics(EnumAnalyticEvent.NativeAdsImpression + nameAds);
  //   console.log(EnumAnalyticEvent.NativeAdsImpression + nameAds);
  //   onAdImpression?.();
  // };
  //
  // const onAdOpenedAdmob = () => {
  //   logEventAnalytics(EnumAnalyticEvent.NativeAdsOpened + nameAds);
  //   console.log(EnumAnalyticEvent.NativeAdsOpened + nameAds);
  //   onAdOpened?.();
  // };
  //
  // const onAdLeftApplicationAdmob = () => {
  //   logEventAnalytics(EnumAnalyticEvent.NativeAdsLeftApplication + nameAds);
  //   console.log(EnumAnalyticEvent.NativeAdsLeftApplication + nameAds);
  //   onAdLeftApplication?.();
  // };
  //
  // const onAdClosedAdmob = () => {
  //   logEventAnalytics(EnumAnalyticEvent.NativeAdsClosed + nameAds);
  //   console.log(EnumAnalyticEvent.NativeAdsClosed + nameAds);
  //   onAdClosed?.();
  // };
  //
  // const onAdLoadedAdmob = () => {
  //   logEventAnalytics(EnumAnalyticEvent.NativeAdsLoaded + nameAds);
  //   console.log(EnumAnalyticEvent.NativeAdsLoaded + nameAds);
  //   setTimeout(() => dispatch(setStateToImpression({})), 500);
  //   onAdLoaded?.();
  // };
  //
  // return (
  //   <NativeAdView
  //     ref={nativeAdViewRef}
  //     onAdFailedToLoad={onAdFailedToLoadAdmob}
  //     onAdClicked={onAdClickedAdmob}
  //     onNativeAdLoaded={onNativeAdLoadedAdmob}
  //     onAdImpression={onAdImpressionAdmob}
  //     onAdOpened={onAdOpenedAdmob}
  //     onAdLeftApplication={onAdLeftApplicationAdmob}
  //     onAdClosed={onAdClosedAdmob}
  //     onAdLoaded={onAdLoadedAdmob}
  //     {...props}
  //   >
  //     {props.children}
  //   </NativeAdView>
  // );
  return null
});

export default NativeAdmob;
