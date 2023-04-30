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
import {EnumAnalyticEvent} from "constants/anlytics.constant";

interface Props {
    onAdClicked: () => void
    onAddImpression?: () => void
}

const WIDTH = Math.min(Device.width - HS._32, Device.width - 16)

const AdsNativeAdmob = ({onAdClicked, onAddImpression}: Props, ref) => {
    const dispatch = useAppDispatch()
    const {styles, theme} = useSystem(createStyles)
    const {nativeAdsId} = useDisplayAds()
    const nativeAdViewRef = useRef<NativeAdView>(null);
    const [dataAds, setDataAds] = useState<any>()
    const [readyToShowAds, setReadyToShowAds] = useState(true)
    const adAlreadyImpression = useRef(false)
    const refShouldReLoadAds = useRef<boolean>(false)

    useEffect(() => {
        if (readyToShowAds) {
            const interval = setInterval(() => {
                if (nativeAdViewRef.current) {
                    clearInterval(interval)
                    nativeAdViewRef.current?.loadAd()
                }
            }, 50)
        } else {
            setReadyToShowAds(true)
        }
    }, [readyToShowAds])

    useEffect(() => {
        if (nativeAdsId && refShouldReLoadAds.current) {
            refShouldReLoadAds.current = false;
            nativeAdViewRef.current?.loadAd();
        }
    }, [nativeAdsId])


    useImperativeHandle(ref, () => ({
        onAdFailedToLoad,
        loadAd: () => {
            setDataAds(undefined)
            if (adAlreadyImpression.current) {
                adAlreadyImpression.current = false
                setReadyToShowAds(false)
            }
        }
    }))

    //////////////

    const onAdFailedToLoad = useCallback((error) => {
        if (!(error.code == 0 && error.currencyCode == "USD")) {
            logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad + "alert")
            console.log(EnumAnalyticEvent.NativeAdsFailedToLoad + "alert")
            console.log("Call switchAdsId alert")
            dispatch(switchAdsId("native"))
            refShouldReLoadAds.current = true;
        }
    }, [])

    const onNativeAdLoaded = useCallback((data) => {
        logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "alert")
        console.log(EnumAnalyticEvent.onNativeAdsLoaded + "alert")
        setDataAds(data)
    }, [])

    const onAdClickedCurrent = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked + "alert")
        console.log(EnumAnalyticEvent.NativeAdsClicked + "alert")
        onAdClicked?.()
    }, [onAdClicked])

    const onAdImpression = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsImpression + "alert")
        console.log(EnumAnalyticEvent.NativeAdsImpression + "alert")
        adAlreadyImpression.current = true
        onAddImpression?.()
    }, [])

    const onAdOpened = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsOpened + "alert")
        console.log(EnumAnalyticEvent.NativeAdsOpened + "alert")
    }, [])

    const onAdLeftApplication = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLeftApplication + "alert")
        console.log(EnumAnalyticEvent.NativeAdsLeftApplication + "alert")
    }, [])

    const onAdClosed = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClosed + "alert")
        console.log(EnumAnalyticEvent.NativeAdsClosed + "alert")
    }, [])

    const onAdLoaded = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLoaded + "alert")
        console.log(EnumAnalyticEvent.NativeAdsLoaded + "alert")
    }, [])

    //////////////

    if (!readyToShowAds) {
        return null
    }

    return (
        <NativeAdView
            style={{width: "100%", paddingBottom: MHS._4}}
            ref={nativeAdViewRef}
            adChoicesPlacement="bottomRight"
            adUnitID={nativeAdsId}

            onAdFailedToLoad={onAdFailedToLoad}
            onAdClicked={onAdClickedCurrent}
            onNativeAdLoaded={onNativeAdLoaded}
            onAdImpression={onAdImpression}
            onAdOpened={onAdOpened}
            onAdLeftApplication={onAdLeftApplication}
            onAdClosed={onAdClosed}
            onAdLoaded={onAdLoaded}

            videoOptions={{
                muted: true
            }}
        >
            {
                dataAds ? (
                    <>
                        <View style={{flexGrow: 1, flexShrink: 1, paddingHorizontal: HS._16,}}>
                            <AdBadge/>
                            <View style={{flexDirection: "row", alignItems: "center", gap: HS._8}}>
                                <IconView style={{width: 40, height: 40}}/>
                                <View style={{flex: 1}}>
                                    <HeadlineView style={{fontWeight: 'bold', fontSize: 13, color: theme.text}}/>
                                    <TaglineView numberOfLines={2} style={{fontSize: 11, color: theme.text}}/>
                                </View>
                            </View>
                        </View>
                        <NativeMediaView style={styles.mediaView}/>

                        <CallToActionView
                            style={{...styles.buttonAds, backgroundColor: theme.btnActive}}
                            textStyle={styles.titleButton}
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
            borderRadius: MHS._16,
            marginTop: VS._10
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
