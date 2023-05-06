import TextBase from 'components/TextBase';
import {useAppDispatch, useAppSelector} from 'configs/store.config';
import {EnumAnalyticEvent} from 'constants/anlytics.constant';
import {NAVIGATION_SUMMARY_SCREEN} from 'constants/router.constant';
import {GlobalPopupHelper} from 'helpers/index';
import navigationHelper from 'helpers/navigation.helper';
import {logEventAnalytics, useDisplayAds, useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, Pressable, StyleSheet, View} from 'react-native';
import NativeAdView, {
    AdBadge,
    CallToActionView,
    HeadlineView,
    IconView,
    NativeMediaView,
    TaglineView
} from 'react-native-admob-native-ads';
import {setStateToImpression, switchAdsId} from 'store/reducer/system.reducer.store';
import {FontSizes, FontWeights, HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import FastImage from "react-native-fast-image";
import {TypedBookSummary} from "models/book.modal";

const DEFAULT_IMAGE = require('assets/images/book-default.png')


const ItemHistory = ({item, index}: { item: TypedBookSummary, index: number }) => {
    const {styles, theme} = useSystem(createStyles)
    const {nativeAdsId, native_ads_pre, native_ads_list} = useDisplayAds()
    const nativeAdViewRef = useRef<NativeAdView>(null)
    const [dataAds, setDataAds] = useState<any>()
    const dispatch = useAppDispatch()
    const refShouldReLoadAds = useRef<boolean>(true)
    const isPremium = useAppSelector(state => state.system.isPremium)
    const refIsPremium = useRef(isPremium)

    useEffect(()=>{
        refIsPremium.current = isPremium
    },[isPremium])

    useEffect(() => {
        if (nativeAdsId && refShouldReLoadAds.current && native_ads_list) {
            refShouldReLoadAds.current = false;
            nativeAdViewRef.current?.loadAd()
        }
    }, [nativeAdsId, native_ads_list])

    //////////////

    const onAdFailedToLoad = useCallback((error) => {
        if (!(error.code == 0 && error.currencyCode == "USD")) {
            logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad + "list")
            console.log(EnumAnalyticEvent.NativeAdsFailedToLoad + "list")
            console.log("Call switchAdsId list")
            dispatch(switchAdsId("native"))
            refShouldReLoadAds.current = true;
        }
    }, [])

    const onNativeAdLoaded = useCallback((data) => {
        logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "list")
        console.log(EnumAnalyticEvent.onNativeAdsLoaded + "list")
        setDataAds(data)
    }, [])

    const onAdClicked = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked + "list")
        console.log(EnumAnalyticEvent.NativeAdsClicked + "list")
    }, [])

    const onAdImpression = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsImpression + "list")
        console.log(EnumAnalyticEvent.NativeAdsImpression + "list")
    }, [])

    const onAdOpened = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsOpened + "list")
        console.log(EnumAnalyticEvent.NativeAdsOpened + "list")
    }, [])

    const onAdLeftApplication = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLeftApplication + "list")
        console.log(EnumAnalyticEvent.NativeAdsLeftApplication + "list")
    }, [])

    const onAdClosed = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClosed + "list")
        console.log(EnumAnalyticEvent.NativeAdsClosed + "list")
    }, [])

    const onAdLoaded = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLoaded + "list")
        console.log(EnumAnalyticEvent.NativeAdsLoaded + "list")
        setTimeout(()=>dispatch(setStateToImpression({})),500)
    }, [])

    //////////////

    const renderAds = () => {
        if (refIsPremium.current || !native_ads_list || (index != 0 && index != 2)) {
            return null
        }

        return (
            <NativeAdView
                adUnitID={nativeAdsId}
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
                <View style={styles.item}>
                    {
                        dataAds ? (
                            <>
                                <IconView style={{width: MHS._66, height: MHS._66, borderRadius: MHS._66}}/>
                                <View style={{flex: 1, marginRight: HS._8}}>
                                    <HeadlineView style={{
                                        fontSize: FontSizes._16, ...FontWeights.Bold_600_SVN,
                                        color: theme.text
                                    }} numberOfLines={1}/>
                                    <TaglineView style={{
                                        fontSize: FontSizes._14, ...FontWeights.Bold_600_SVN,
                                        color: theme.textInactive
                                    }} numberOfLines={1}/>
                                    <CallToActionView
                                        style={{backgroundColor: theme.background, marginTop: VS._10}}
                                        textStyle={{
                                            color: theme.textMain,
                                            fontSize: FontSizes._14, ...FontWeights.Bold_600_SVN,
                                            textTransform: "lowercase",
                                            width: HS._140,
                                            textAlign: 'center',
                                        }}
                                        buttonAndroidStyle={{backgroundColor: theme.background}}
                                        allowFontScaling={false}
                                        allCaps
                                    />
                                    <AdBadge style={{marginTop: MHS._40}}/>
                                </View>
                                <NativeMediaView
                                    style={{
                                        width: MHS._66, height: MHS._66, borderRadius: MHS._10,
                                    }}
                                />
                            </>
                        ) : null
                    }
                </View>
            </NativeAdView>
        )
    }

    const onPressItem = () => {
        Keyboard.dismiss();
        if(refIsPremium.current){
            onConfirmPressItem()
            return;
        }

        if (native_ads_pre) {
            GlobalPopupHelper.alertAdsRef.current?.alert({
                title: languages.homeScreen.seeConversation,
                message: languages.homeScreen.seeConversationDes,
                actions: [{
                    text: languages.confirm,
                    onPress: onConfirmPressItem
                }]
            })
        } else {
            GlobalPopupHelper.alertRef.current?.alert({
                title: languages.homeScreen.seeConversation,
                message: languages.homeScreen.seeConversationDes,
                actions: [{
                    text: languages.confirm,
                    onPress: onConfirmPressItem
                }]
            })
        }
    }

    const onConfirmPressItem = () => {
        navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {book: item, summary: true})
    }

    return (
        <View style={styles.container}>
            <Pressable style={styles.item} onPress={onPressItem}>
                <FastImage
                    source={item.volumeInfo?.imageLinks?.thumbnail ? {uri: item.volumeInfo?.imageLinks?.thumbnail} : DEFAULT_IMAGE}
                    style={{width: MHS._60, height: MHS._60, alignSelf: "center", marginRight: HS._6}}
                    resizeMode={"contain"}
                />
                <View style={{flex: 1, marginRight: HS._8}}>
                    <TextBase title={item.volumeInfo?.title} fontSize={FontSizes._14} color={theme.text}
                              numberOfLines={2}/>

                    {
                        item.volumeInfo?.authors?.[0] ?
                            <TextBase title={languages.homeScreen.author + item.volumeInfo?.authors?.[0]}
                                      style={{marginTop: MHS._6}}
                                      fontSize={FontSizes._12} color={theme.text} fontWeight={"bold"}
                                      numberOfLines={1}/>
                            :
                            null
                    }

                </View>
            </Pressable>
            {
                renderAds()
            }

        </View>
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {},
        item: {
            flexDirection: "row",
            paddingHorizontal: HS._16,
            paddingVertical: VS._10,
            gap: HS._8,
            alignItems: "center"
        }
    })
}

export default ItemHistory;
