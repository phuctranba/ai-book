import {EnumAnalyticEvent} from 'constants/anlytics.constant';
import {GlobalPopupHelper} from 'helpers/index';
import {logEventAnalytics, useDisplayAds, useSystem} from 'helpers/system.helper';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import NativeAdView, {
    AdBadge,
    CallToActionView,
    HeadlineView,
    IconView,
    NativeMediaView,
    TaglineView
} from 'react-native-admob-native-ads';
import {Device} from 'ui/device.ui';
import {FontSizes, FontWeights, HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import {useAppDispatch} from "configs/store.config";
import {switchAdsId} from "store/reducer/system.reducer.store";

interface Props {
    onAdClicked: () => void
    onAdLoadFailedProps: () => void
}

const WIDTH = Math.min(Device.width - HS._32, Device.width - 16)

const AdsNativeAdmob = ({onAdClicked, onAdLoadFailedProps}: Props, ref) => {
    const dispatch = useAppDispatch()
    const {styles, theme} = useSystem(createStyles)
    const {nativeAdsId, native_ads_country} = useDisplayAds()
    const nativeAdViewRef = useRef<NativeAdView>(null);
    const [dataAds, setDataAds] = useState<any>()
    const refShouldReLoadAds = useRef<boolean>(true)

    useEffect(()=>{
        if(nativeAdsId && refShouldReLoadAds.current && native_ads_country){
            refShouldReLoadAds.current = false;
            nativeAdViewRef.current?.loadAd();
        }
    },[nativeAdsId, native_ads_country])

    useImperativeHandle(ref, () => ({
        onAdFailedToLoad
    }))

    //////////////

    const onAdFailedToLoad = useCallback((error) => {
        if (!(error.code == 0 && error.currencyCode == "USD")) {
            logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad+"country")
            console.log(EnumAnalyticEvent.NativeAdsFailedToLoad+"country")
            console.log("Call switchAdsId country")
            dispatch(switchAdsId("native"))
            refShouldReLoadAds.current = true;
        }
        onAdLoadFailedProps?.()
    },[onAdLoadFailedProps])

    const onNativeAdLoaded = useCallback((data) => {
        logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded+"country")
        console.log(EnumAnalyticEvent.onNativeAdsLoaded+"country")
        GlobalPopupHelper.modalLoadingRef.current?.hide()
        setDataAds(data)
    },[])

    const onAdClickedCurrent = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked+"country")
        console.log(EnumAnalyticEvent.NativeAdsClicked+"country")
        onAdClicked?.()
    }, [onAdClicked])

    const onAdImpression = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsImpression+"country")
        console.log(EnumAnalyticEvent.NativeAdsImpression+"country")
    }, [])

    const onAdOpened = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsOpened+"country")
        console.log(EnumAnalyticEvent.NativeAdsOpened+"country")
    }, [])

    const onAdLeftApplication = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLeftApplication+"country")
        console.log(EnumAnalyticEvent.NativeAdsLeftApplication+"country")
    }, [])

    const onAdClosed = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClosed+"country")
        console.log(EnumAnalyticEvent.NativeAdsClosed+"country")
    }, [])

    const onAdLoaded = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLoaded+"country")
        console.log(EnumAnalyticEvent.NativeAdsLoaded+"country")
    }, [])

    //////////////

    return (
        <NativeAdView
            adUnitID={nativeAdsId}
            style={{width: "100%", paddingBottom: MHS._4}}
            ref={nativeAdViewRef}
            adChoicesPlacement={"bottomRight"}
            videoOptions={{
                muted: true
            }}

            onAdFailedToLoad={onAdFailedToLoad}
            onAdClicked={onAdClickedCurrent}
            onNativeAdLoaded={onNativeAdLoaded}
            onAdImpression={onAdImpression}
            onAdOpened={onAdOpened}
            onAdLeftApplication={onAdLeftApplication}
            onAdClosed={onAdClosed}
            onAdLoaded={onAdLoaded}
        >
            {
                dataAds ? (
                    <>
                        <View style={{flexGrow: 1, flexShrink: 1, paddingHorizontal: HS._16,}}>
                            <AdBadge/>
                            <View style={{flexDirection: "row", alignItems: "center", gap: HS._8}}>
                                <IconView style={{width: 40, height: 40}}/>
                                <View style={{flex: 1}}>
                                    <HeadlineView style={{fontWeight: 'bold', fontSize: 13, color: theme.textDark}}/>
                                    <TaglineView numberOfLines={2} style={{fontSize: 11, color: theme.textDark}}/>
                                </View>
                            </View>
                        </View>
                        <NativeMediaView
                            style={{
                                width: Device.width, height: Device.height / 3
                            }}
                        />

                        <CallToActionView
                            style={{...styles.buttonAds, backgroundColor: theme.btnActive}}
                            textStyle={{color: theme.textLight, fontSize: FontSizes._16, ...FontWeights.Bold_600_SVN}}
                            buttonAndroidStyle={{...styles.buttonAds, backgroundColor: theme.btnActive}}
                            allowFontScaling={false}
                            allCaps
                        />
                    </>
                ) : null
            }
        </NativeAdView>
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background
        },
        buttonAds: {
            width: "80%",
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: MHS._16
        },
        titleButton: {
            color: theme.textLight,
            fontSize: FontSizes._16,
            ...FontWeights.Bold_600_SVN
        },
        mediaView: {
            width: WIDTH,
            height: VS._100
        }
    })
}

export default forwardRef(AdsNativeAdmob);
