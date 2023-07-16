import TextBase from 'components/TextBase';
import { useAppDispatch } from 'configs/store.config';
import { EnumAnalyticEvent } from 'constants/anlytics.constant';
import { GlobalPopupHelper } from 'helpers/index';
import { logEventAnalytics, useNativeAds, useSystem } from "helpers/system.helper";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import NativeAdView, { AdBadge, CallToActionView, HeadlineView, IconView, NativeMediaView, TaglineView } from 'react-native-admob-native-ads';
import FastImage from 'react-native-fast-image';
import { setStateToImpression} from "store/reducer/system.reducer.store";
import { Device } from 'ui/device.ui';
import { FontSizes, FontWeights, HS, MHS, VS } from 'ui/sizes.ui';
import { SystemTheme } from 'ui/theme';
import { randomAppAds } from "constants/system.constant";
import RNBootSplash from "react-native-bootsplash";


const WIDTH = Math.min(Device.width - HS._32, Device.width - 16)

const AdsNativeCountry = ({onNativeAdDone, onAdLoadFailedProps, onAdClickedAdmob}, ref) => {
    const { styles, theme } = useSystem(createStyles)
    const { nativeAdsId, use_native_ads, switchAdsId} = useNativeAds();
    const nativeAdViewRef = useRef<NativeAdView>(null);
    const [dataAds, setDataAds] = useState<any>()
    const dispatch = useAppDispatch()
    const [clicked, setClicked] = useState(false)
    const refDataAdsEcosystem = useRef(randomAppAds())
    const refTimeCheck = useRef(new Date().getTime())

    useEffect(() => {
        if (nativeAdsId && use_native_ads) {
            setTimeout(()=>{
                logEventAnalytics(EnumAnalyticEvent.onNativeCallLoaded + "country")
                console.log(EnumAnalyticEvent.onNativeCallLoaded + "country")
                refTimeCheck.current = new Date().getTime()
                console.log(nativeAdViewRef.current)
                nativeAdViewRef.current?.loadAd();
            },0)
        }
    }, [nativeAdsId, use_native_ads])

    //////////////

    const onAdFailedToLoad = (error) => {
        if (!(error.code == 0 && error.currencyCode == "USD")) {
            logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad + "country", {
                //@ts-ignore
                code: error?.code,
                message: error?.message,
                currencyCode: error?.currencyCode
            })
            console.log(EnumAnalyticEvent.NativeAdsFailedToLoad + "country")
            console.log("Call switchAdsId country")
            switchAdsId()
        }
        onAdLoadFailedProps?.()
    }

    const onNativeAdLoaded = useCallback((data) => {
        logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "country_"+data.video.toString()+"_"+Math.round((new Date().getTime()-refTimeCheck.current)/1000))
        logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "country_"+data.video.toString())
        logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "country")
        onNativeAdDone?.()
        RNBootSplash.hide({ fade: false });
        setDataAds(data)
    }, [])

    const onAdClicked = useCallback(() => {
        onAdClickedAdmob?.();
        setClicked(true)
        GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked + "country")
        console.log(EnumAnalyticEvent.NativeAdsClicked + "country")
    }, [])

    const onAdImpression = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsImpression + "country")
        console.log(EnumAnalyticEvent.NativeAdsImpression + "country")
    }, [])

    const onAdOpened = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsOpened + "country")
        console.log(EnumAnalyticEvent.NativeAdsOpened + "country")
    }, [])

    const onAdLeftApplication = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLeftApplication + "country")
        console.log(EnumAnalyticEvent.NativeAdsLeftApplication + "country")
    }, [])

    const onAdClosed = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClosed + "country")
        console.log(EnumAnalyticEvent.NativeAdsClosed + "country")
    }, [])

    const onAdLoaded = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLoaded + "country")
        console.log(EnumAnalyticEvent.NativeAdsLoaded + "country")
        setTimeout(() => {
            dispatch(setStateToImpression({}));
            logEventAnalytics("call_to_impression_country")
        }, 500)
    }, [])

    if (clicked) {
        return (
            <Pressable
                onPress={() => {
                    logEventAnalytics(EnumAnalyticEvent.EcosystemAdsClick+"_"+refDataAdsEcosystem.current.name)
                    GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
                    Linking.openURL(refDataAdsEcosystem.current.link)
                }}
            >
                <View style={{ flexDirection: 'row', marginVertical: VS._8, width: '100%' }}>
                    <FastImage
                        source={typeof refDataAdsEcosystem.current.logo === 'number' ? refDataAdsEcosystem.current.logo : {uri: refDataAdsEcosystem.current.logo}}
                        style={{
                            width: 40,
                            height: 40,
                        }}
                        resizeMode={'contain'}
                    />
                    <View style={{ flex: 1, marginHorizontal: HS._8, justifyContent: 'space-around' }}>
                        <TextBase title={refDataAdsEcosystem.current.title} style={{ fontWeight: 'bold', fontSize: 13, color: theme.text }} />
                        <TextBase title={refDataAdsEcosystem.current.description} numberOfLines={2} style={{ fontSize: 11, color: theme.text }} />
                    </View>
                </View>

                <View style={{width: MHS._280, flexDirection: 'row', justifyContent: 'space-between', alignSelf:'center' }}>
                    <FastImage
                        source={typeof refDataAdsEcosystem.current.image[0] === 'number' ? refDataAdsEcosystem.current.image[0]: {uri:refDataAdsEcosystem.current.image[0]}}
                        style={{
                            width: "32.5%",
                            height: MHS._280 / (14 / 9),
                        }}
                        resizeMode={'contain'}
                    />
                    <FastImage
                        source={typeof refDataAdsEcosystem.current.image[1] === 'number' ? refDataAdsEcosystem.current.image[1]: {uri:refDataAdsEcosystem.current.image[1]}}
                        style={{
                            width: "32.5%",
                            height: MHS._280 / (14 / 9),
                        }}
                        resizeMode={'contain'}
                    />
                    <FastImage
                        source={typeof refDataAdsEcosystem.current.image[2] === 'number' ? refDataAdsEcosystem.current.image[2]: {uri:refDataAdsEcosystem.current.image[2]}}
                        style={{
                            width: "32.5%",
                            height: MHS._280 / (14 / 9),
                        }}
                        resizeMode={'contain'}
                    />
                </View>

                <View
                    style={{ ...styles.buttonAds, backgroundColor: theme.btnActive, alignSelf: "center", marginTop: VS._6 }}
                >
                    <TextBase title={"Confirm"} numberOfLines={2} style={{ fontSize: 16, color: theme.textLight }} fontWeight={'bold'} />
                </View>
            </Pressable>
        )
    }

    //////////////

    return (
        <NativeAdView
            adUnitID={nativeAdsId}
            style={{ width: "100%", paddingBottom: MHS._4 }}
            ref={nativeAdViewRef}
            adChoicesPlacement={"bottomRight"}
            videoOptions={{
                muted: true
            }}
            onAdFailedToLoad={onAdFailedToLoad}
            onAdClicked={onAdClicked}
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
                        <View style={{ flexGrow: 1, flexShrink: 1, paddingHorizontal: HS._16, }}>
                            <AdBadge />
                            <View style={{ flexDirection: "row", alignItems: "center", gap: HS._8 }}>
                                <IconView style={{ width: 40, height: 40 }} />
                                <View style={{ flex: 1 }}>
                                    <HeadlineView style={{ fontWeight: 'bold', fontSize: 13, color: theme.text }} />
                                    <TaglineView numberOfLines={2} style={{ fontSize: 11, color: theme.text }} />
                                </View>
                            </View>
                        </View>
                        <NativeMediaView
                            style={{
                                width: MHS._280, height: MHS._280 / (14 / 9), alignSelf:'center'
                            }}
                        />

                        <CallToActionView
                            style={{ ...styles.buttonAds, backgroundColor: theme.btnActive }}
                            textStyle={{ color: theme.textLight, fontSize: FontSizes._16, ...FontWeights.Bold_600_SVN }}
                            buttonAndroidStyle={{ ...styles.buttonAds, backgroundColor: theme.btnActive }}
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

export default forwardRef(AdsNativeCountry);
