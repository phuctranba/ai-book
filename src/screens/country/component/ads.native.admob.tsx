import TextBase from 'components/TextBase';
import {useAppDispatch} from 'configs/store.config';
import {EnumAnalyticEvent} from 'constants/anlytics.constant';
import {GlobalPopupHelper} from 'helpers/index';
import {logEventAnalytics, useDisplayAds, useSystem} from 'helpers/system.helper';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Linking, Pressable, StyleSheet, View} from 'react-native';
import NativeAdView, {
    AdBadge,
    CallToActionView,
    HeadlineView,
    IconView,
    NativeMediaView,
    TaglineView
} from 'react-native-admob-native-ads';
import FastImage from 'react-native-fast-image';
import {setFirstInstall, setStateToImpression, switchAdsId} from "store/reducer/system.reducer.store";
import {Device} from 'ui/device.ui';
import {FontSizes, FontWeights, HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import {randomAppAds} from "constants/system.constant";

interface Props {
    onAdClicked: () => void
    onAdLoadFailedProps: () => void
}

const WIDTH = Math.min(Device.width - HS._32, Device.width - 16)

const AdsNativeCountry = ({onAdClicked, onAdLoadFailedProps}: Props, ref) => {
    const {styles, theme} = useSystem(createStyles)
    const {nativeAdsId, use_native_ads} = useDisplayAds()
    const nativeAdViewRef = useRef<NativeAdView>(null);
    const [dataAds, setDataAds] = useState<any>()
    const dispatch = useAppDispatch()
    const refShouldReLoadAds = useRef<boolean>(true)
    const [clicked, setClicked] = useState(false)
    const refDataAdsEcosystem = useRef(randomAppAds())

    useEffect(() => {
        if (nativeAdsId && refShouldReLoadAds.current && use_native_ads) {
            refShouldReLoadAds.current = false;
            nativeAdViewRef.current?.loadAd();
        }
    }, [nativeAdsId, use_native_ads])

    useImperativeHandle(ref, () => ({
        onAdLoadFailed: onAdFailedToLoad
    }))

    //////////////

    const onAdFailedToLoad = useCallback((error) => {
        if (!(error.code == 0 && error.currencyCode == "USD")) {
            logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad + "country", {
                //@ts-ignore
                code: error?.code,
                message: error?.message,
                currencyCode: error?.currencyCode
            })
            console.log(EnumAnalyticEvent.NativeAdsFailedToLoad + "country")
            console.log("Call switchAdsId country")
            dispatch(switchAdsId("native"))
            refShouldReLoadAds.current = true;
        }
        // onAdLoadFailedProps?.()
    }, [onAdLoadFailedProps])

    const onNativeAdLoaded = useCallback((data) => {
        logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "country")
        console.log(EnumAnalyticEvent.onNativeAdsLoaded + "country")
        GlobalPopupHelper.modalLoadingRef.current?.hide()
        setDataAds(data)
    }, [])

    const onAdClickedCurrent = useCallback(() => {
        setClicked(true)
        GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked + "country")
        console.log(EnumAnalyticEvent.NativeAdsClicked + "country")
        onAdClicked?.()
    }, [onAdClicked])

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
        setTimeout(() => dispatch(setStateToImpression({})), 500)
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
                <View style={{flexDirection: 'row', marginVertical: VS._8, width: '100%'}}>
                    <FastImage
                        source={refDataAdsEcosystem.current.logo}
                        style={{
                            width: 40,
                            height: 40,
                        }}
                        resizeMode={'contain'}
                    />
                    <View style={{flex: 1, marginHorizontal: HS._8, justifyContent: 'space-around'}}>
                        <TextBase title={refDataAdsEcosystem.current.title}
                                  style={{fontWeight: 'bold', fontSize: 13, color: theme.text}}/>
                        <TextBase title={refDataAdsEcosystem.current.description} numberOfLines={2}
                                  style={{fontSize: 11, color: theme.text}}/>
                    </View>
                </View>

                <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <FastImage
                        source={refDataAdsEcosystem.current.image[0]}
                        style={{
                            width: "32.5%",
                            height: Device.height / 3,
                        }}
                        resizeMode={'cover'}
                    />
                    <FastImage
                        source={refDataAdsEcosystem.current.image[1]}
                        style={{
                            width: "32.5%",
                            height: Device.height / 3,
                        }}
                        resizeMode={'cover'}
                    />
                    <FastImage
                        source={refDataAdsEcosystem.current.image[2]}
                        style={{
                            width: "32.5%",
                            height: Device.height / 3,
                        }}
                        resizeMode={'cover'}
                    />
                </View>

                <View
                    style={{...styles.buttonAds, backgroundColor: theme.btnActive, alignSelf: "center", marginTop:VS._6}}
                >
                    <TextBase title={"Confirm"} numberOfLines={2}
                              style={{fontSize: FontSizes._16, color: theme.textLight}} fontWeight={'bold'}/>
                </View>
            </Pressable>
        )
    }

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
                                    <HeadlineView style={{fontWeight: 'bold', fontSize: 13, color: theme.text}}/>
                                    <TaglineView numberOfLines={2} style={{fontSize: 11, color: theme.text}}/>
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

export default forwardRef(AdsNativeCountry);
