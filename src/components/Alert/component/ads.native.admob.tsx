import TextBase from "components/TextBase";
import { EnumAnalyticEvent } from "constants/anlytics.constant";
import { GlobalPopupHelper } from "helpers/index";
import { logEventAnalytics, useNativeAds, useSystem } from "helpers/system.helper";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import NativeAdView, {
    AdBadge,
    CallToActionView,
    HeadlineView,
    IconView,
    NativeMediaView,
    TaglineView
} from "react-native-admob-native-ads";
import FastImage from "react-native-fast-image";
import { Device } from "ui/device.ui";
import { FontSizes, FontWeights, HS, MHS, VS } from "ui/sizes.ui";
import { SystemTheme } from "ui/theme";
import { randomAppAds } from "constants/system.constant";
import { useAppSelector } from "configs/store.config";

interface Props {
    onAdClicked: () => void;
    onAddImpression?: () => void;
}

const WIDTH = Math.min(Device.width - HS._32, Device.width - 16);

const AdsNativeAdmob = ({ onAdClicked, onAddImpression }: Props, ref) => {
    const { styles, theme } = useSystem(createStyles);
    const { nativeAdsId, use_native_ads, switchAdsId } = useNativeAds();
    const nativeAdViewRef = useRef<NativeAdView>(null);
    const [dataAds, setDataAds] = useState<any>();
    const [readyToShowAds, setReadyToShowAds] = useState(!Device.isIos);
    const adAlreadyImpression = useRef(false);
    const [clicked, setClicked] = useState(false);
    const refDataAdsEcosystem = useRef(randomAppAds())
    const refIsLoaded = useRef(false)
    const refNativeAdsId = useRef(nativeAdsId)
    const isConnectedInternet = useAppSelector(state => state.system.isConnectedInternet)
    // không muốn vài cái useeffect chạy lần đầu
    const refNeedToDoSomeActionAfterOneSecond = useRef(false)

    useEffect(()=>{
        if(isConnectedInternet && refNeedToDoSomeActionAfterOneSecond.current && !refIsLoaded.current){
            const interval = setInterval(() => {
                if (nativeAdViewRef.current && refNativeAdsId.current) {
                    clearInterval(interval);
                    nativeAdViewRef.current?.loadAd();
                }
            }, 100);
        }

        setTimeout(()=>refNeedToDoSomeActionAfterOneSecond.current=true,1000)
    },[isConnectedInternet])

    useEffect(()=>{
        refNativeAdsId.current = nativeAdsId
    },[nativeAdsId])

    useEffect(() => {
        if (readyToShowAds && isConnectedInternet) {
            const interval = setInterval(() => {
                if (nativeAdViewRef.current && refNativeAdsId.current) {
                    clearInterval(interval);
                    nativeAdViewRef.current?.loadAd();
                }
            }, 100);
        } else {
            setTimeout(() => {
                setReadyToShowAds(true);
            }, Device.isIos ? 200 : 0);
        }
    }, [readyToShowAds]);

    useEffect(() => {
        if (nativeAdsId && use_native_ads && refNeedToDoSomeActionAfterOneSecond.current && !refIsLoaded.current) {
            setTimeout(() => {
                nativeAdViewRef.current?.loadAd();
            },  0);
        }
    }, [nativeAdsId, use_native_ads]);


    useImperativeHandle(ref, () => ({
        onAdFailedToLoad,
        loadAd: () => {
            setDataAds(undefined);
            refIsLoaded.current = false;
            if (adAlreadyImpression.current) {
                setClicked(false);
                adAlreadyImpression.current = false;
                setReadyToShowAds(false);
            }
        }
    }));

    //////////////

    const onAdFailedToLoad = (error) => {
        if (!(error.code == 0 && error.currencyCode == "USD")) {
            logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad + "alert", {
                //@ts-ignore
                code: error?.code,
                message: error?.message,
                currencyCode: error?.currencyCode
            });
            console.log(EnumAnalyticEvent.NativeAdsFailedToLoad + "alert");
            console.log("Call switchAdsId alert");
            console.log(error);
            switchAdsId()
        }
    }

    const onNativeAdLoaded = useCallback((data) => {
        logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "alert");
        console.log(EnumAnalyticEvent.onNativeAdsLoaded + "alert");
        setDataAds(data);
        refIsLoaded.current = true;
    }, []);

    const onAdClickedCurrent = useCallback(() => {
        GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked + "alert");
        console.log(EnumAnalyticEvent.NativeAdsClicked + "alert");
        onAdClicked?.();
        setClicked(true);
    }, [onAdClicked]);

    const onAdImpression = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsImpression + "alert");
        console.log(EnumAnalyticEvent.NativeAdsImpression + "alert");
        adAlreadyImpression.current = true;
        onAddImpression?.();
    }, []);

    const onAdOpened = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsOpened + "alert");
        console.log(EnumAnalyticEvent.NativeAdsOpened + "alert");
    }, []);

    const onAdLeftApplication = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLeftApplication + "alert");
        console.log(EnumAnalyticEvent.NativeAdsLeftApplication + "alert");
    }, []);

    const onAdClosed = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClosed + "alert");
        console.log(EnumAnalyticEvent.NativeAdsClosed + "alert");
    }, []);

    const onAdLoaded = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLoaded + "alert");
        console.log(EnumAnalyticEvent.NativeAdsLoaded + "alert");
        refDataAdsEcosystem.current = randomAppAds();
    }, []);

    //////////////

    if (clicked) {
        return (
            <Pressable
                onPress={() => {
                    logEventAnalytics(EnumAnalyticEvent.EcosystemAdsClick + "_" + refDataAdsEcosystem.current.name);
                    GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
                    Linking.openURL(refDataAdsEcosystem.current.link);
                }}
                style={{ width: "100%" }}>
                <View style={{ paddingHorizontal: HS._16 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: HS._8 }}>
                        <FastImage
                            source={typeof refDataAdsEcosystem.current.logo === 'number' ? refDataAdsEcosystem.current.logo : {uri: refDataAdsEcosystem.current.logo}}
                            style={{
                                width: 40,
                                height: 40
                            }}
                            resizeMode={"contain"}
                        />
                        <View style={{ flex: 1 }}>
                            <TextBase title={refDataAdsEcosystem.current.title}
                                      style={{ fontWeight: "bold", fontSize: 13, color: theme.text }} />
                            <TextBase title={refDataAdsEcosystem.current.description} numberOfLines={2}
                                      style={{ fontSize: 11, color: theme.text }} />
                        </View>
                    </View>
                </View>
                <View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                    <FastImage
                        source={typeof refDataAdsEcosystem.current.image[0] === 'number' ? refDataAdsEcosystem.current.image[0]: {uri:refDataAdsEcosystem.current.image[0]}}
                        style={{
                            width: "20%",
                            height: VS._120
                        }}
                        resizeMode={"contain"}
                    />
                    <FastImage
                        source={typeof refDataAdsEcosystem.current.image[1] === 'number' ? refDataAdsEcosystem.current.image[1]: {uri:refDataAdsEcosystem.current.image[1]}}
                        style={{
                            width: "20%",
                            height: VS._120
                        }}
                        resizeMode={"contain"}
                    />
                    <FastImage
                        source={typeof refDataAdsEcosystem.current.image[2] === 'number' ? refDataAdsEcosystem.current.image[2]: {uri:refDataAdsEcosystem.current.image[2]}}
                        style={{
                            width: "20%",
                            height: VS._120
                        }}
                        resizeMode={"contain"}
                    />
                </View>

                <View
                    style={{ ...styles.buttonAds, backgroundColor: theme.btnActive, alignSelf: "center" }}
                >
                    <TextBase title={"Confirm"} numberOfLines={2} style={{ fontSize: FontSizes._16, color: theme.textLight }}
                              fontWeight={"bold"} />
                </View>
            </Pressable>
        );
    }

    if (!readyToShowAds) {
        return null;
    }

    return (
        <NativeAdView
            style={{ width: "100%", paddingBottom: MHS._4 }}
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
                        <View style={{ flexGrow: 1, flexShrink: 1, paddingHorizontal: HS._16 }}>
                            <AdBadge />
                            <View style={{ flexDirection: "row", alignItems: "center", gap: HS._8 }}>
                                <IconView style={{ width: 40, height: 40 }} />
                                <View style={{ flex: 1 }}>
                                    <HeadlineView style={{ fontWeight: "bold", fontSize: 13, color: theme.text }} />
                                    <TaglineView numberOfLines={2} style={{ fontSize: 11, color: theme.text }} />
                                </View>
                            </View>
                        </View>
                        <NativeMediaView style={styles.mediaView} />

                        <CallToActionView
                            style={{ ...styles.buttonAds, backgroundColor: theme.btnActive }}
                            textStyle={styles.titleButton}
                            buttonAndroidStyle={{ ...styles.buttonAds, backgroundColor: theme.btnActive }}
                            allowFontScaling={false}
                            allCaps
                        />
                    </>
                ) : null
            }
        </NativeAdView>
    );
};

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
    });
};

export default forwardRef(AdsNativeAdmob);
