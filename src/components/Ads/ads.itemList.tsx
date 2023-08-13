import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import TextBase from "components/TextBase";
import { useAppSelector } from "configs/store.config";
import { EnumAnalyticEvent } from "constants/anlytics.constant";
import { EnumTheme, randomAppAds } from "constants/system.constant";
import { GlobalPopupHelper } from "helpers/index";
import { logEventAnalytics, useNativeAds, useSystem } from "helpers/system.helper";
import { Linking, Pressable, View } from "react-native";
import NativeAdView, {
    AdBadge,
    CallToActionView,
    HeadlineView,
    IconView,
    NativeAd,
    TaglineView
} from "react-native-admob-native-ads";
import FastImage from "react-native-fast-image";
import { FontSizes, MHS, MVS, VS } from "ui/sizes.ui";
import { RootColor } from "ui/theme";
import {useFocusEffect} from "@react-navigation/native";
import NativeAdmob from "components/Ads/nativeAdmob.ads";

export default function AdsItemList({ showNativeAdmob = true, index = 0, shouldRefresh = false }: { showNativeAdmob?: boolean, index?: number, shouldRefresh?: boolean }) {
    const { theme } = useSystem();
    const nativeAdViewRef = useRef<NativeAdView>(null);
    // const { idAds } = props
    const { nativeAdsId, use_native_ads, native_ads_list } = useNativeAds();
    const [data, setData] = useState<NativeAd | null>(null);
    const themeText = useAppSelector(state => state.system.theme);
    const isPremium = useAppSelector(state => state.system.isPremium);
    const [clicked, setClicked] = useState(false);
    const refDataAdsEcosystem = useRef(randomAppAds());

    const refOneTimeFocus = useRef(false)


    useFocusEffect(
        useCallback(() => {
            if(refOneTimeFocus.current && shouldRefresh && nativeAdsId && use_native_ads && native_ads_list && showNativeAdmob){
                console.log("call refresh")
                nativeAdViewRef.current?.loadAd();
            }else {
                refOneTimeFocus.current = true
            }
        }, [nativeAdsId, use_native_ads, native_ads_list])
    );

    useEffect(() => {
        if (nativeAdsId && use_native_ads && showNativeAdmob && native_ads_list) {
            setTimeout(() => {
                nativeAdViewRef.current?.loadAd();
            }, index * 100);
        }
    }, [nativeAdsId, use_native_ads, native_ads_list]);

    //////////////

    const onNativeAdLoaded = useCallback((data) => {
        setData(data);
    }, []);

    const onAdClickedCurrent = useCallback(() => {
        setClicked(true);
    }, []);

    //////////////

    const EcosystemAds = useMemo(() => {
        return (
            <Pressable
                onPress={() => {
                    logEventAnalytics(EnumAnalyticEvent.EcosystemAdsClick + "_" + refDataAdsEcosystem.current.name);
                    GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
                    Linking.openURL(refDataAdsEcosystem.current.link);
                }}
                style={{
                    paddingHorizontal: MHS._16,
                    paddingVertical: MHS._5,
                    flexDirection: "row",
                    backgroundColor: `${theme.btnInactive}20`,
                    borderRadius: MHS._10,
                    alignItems: "center"
                }}>
                <FastImage
                    source={typeof refDataAdsEcosystem.current.logo === 'number' ? refDataAdsEcosystem.current.logo : {uri: refDataAdsEcosystem.current.logo}}
                    style={{
                        width: MVS._60, height: MVS._60, borderRadius: MHS._5
                    }}
                    resizeMode={"contain"}
                />
                <View style={{ flex: 1, alignItems: "flex-start", justifyContent: "space-around", paddingHorizontal: MHS._5 }}>
                    <TextBase title={refDataAdsEcosystem.current.title} numberOfLines={2} style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: themeText == EnumTheme.Dark ? "#F3F3F3" : "#474747"
                    }} />
                    <TextBase title={refDataAdsEcosystem.current.description} numberOfLines={2}
                              style={{ fontSize: 12, color: themeText == EnumTheme.Dark ? "#F3F3F3" : "#474747" }} />
                </View>
                <View
                    style={{
                        width: MHS._70,
                        paddingVertical: MHS._12,
                        paddingHorizontal: MHS._16,
                        backgroundColor: "#006484",
                        justifyContent: "center",
                        alignItems: "center",
                        elevation: 10,
                        borderRadius: MHS._5
                    }}

                >
                    <TextBase title={"Install"} numberOfLines={2} style={{ fontSize: 12, color: theme.textLight }}
                              fontWeight={"bold"} />
                </View>
            </Pressable>
        );
    }, []);

    if (!nativeAdsId || isPremium) {
        return null;
    }

    if (clicked) {
        return (
            <View style={{ marginTop: VS._10 }}>
                {EcosystemAds}
            </View>
        );
    }

    return (
        <>
            <NativeAdmob
                nameAds={"itemList"}
                onAdClicked={onAdClickedCurrent}
                onNativeAdLoaded={onNativeAdLoaded}
                adUnitID={nativeAdsId}
                ref={nativeAdViewRef}
                style={{ marginTop: VS._10 }}
            >
                {
                    data ?
                        <View style={{
                            paddingHorizontal: MHS._16,
                            paddingVertical: MHS._5,
                            flexDirection: "row",
                            backgroundColor: `${theme.btnInactive}20`,
                            borderRadius: MHS._10
                        }}>
                            <AdBadge style={{ backgroundColor: RootColor.MainColor, borderColor: RootColor.MainColor }}
                                     textStyle={{ color: "#FFF", textAlign: "center" }} />

                            {data?.icon ? <IconView source={{ uri: data?.icon }}
                                                    style={{ width: MVS._60, height: MVS._60, borderRadius: MHS._5 }} /> : null}
                            <View style={{
                                flex: 1,
                                alignItems: "flex-start",
                                justifyContent: "space-around",
                                paddingHorizontal: MHS._5
                            }}>
                                {data?.headline ? <HeadlineView numberOfLines={2} style={{
                                    fontSize: FontSizes._14,
                                    fontWeight: "700",
                                    color: themeText == EnumTheme.Dark ? "#F3F3F3" : "#474747"
                                }} /> : null}
                                {/*<View style={{ flexDirection: "row" }}>*/}
                                {/*	{data?.rating ? <StarRatingView iconSet="MaterialIcons" /> : null}*/}
                                {/*	<View style={{ marginLeft: MHS._4 }}>*/}
                                {/*		<AdBadge style={{ backgroundColor: '#006484' }} textStyle={{ color: "#FFF", textAlign: "center" }} />*/}
                                {/*	</View>*/}
                                {/*</View>*/}
                                {data?.tagline ?
                                    <TaglineView numberOfLines={2} style={{
                                        fontSize: FontSizes._10,
                                        color: themeText == EnumTheme.Dark ? "#F3F3F3" : "#474747"
                                    }} />
                                    : null
                                }
                            </View>
                            {data?.callToAction ?
                                <CallToActionView
                                    // @ts-ignore
                                    buttonAndroidStyle={{
                                        borderRadius: MHS._5,
                                        backgroundColor: "#006484"
                                    }}
                                    textStyle={{
                                        color: "#FFF",
                                        fontSize: MHS._12,
                                        fontWeight: "600"
                                    }}
                                    style={{
                                        width: MHS._70,
                                        paddingVertical: MHS._20,
                                        paddingHorizontal: MHS._16,
                                        backgroundColor: "#006484",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        elevation: 10,
                                        borderRadius: MHS._5
                                    }}

                                /> : null
                            }

                        </View>
                        :
                        null
                }
            </NativeAdmob>
            {!data && EcosystemAds}
        </>

    );
}

