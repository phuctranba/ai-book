import React, {memo, useCallback, useEffect, useRef, useState} from "react";

import TextBase from "components/TextBase";
import {useAppDispatch, useAppSelector} from "configs/store.config";
import {EnumAnalyticEvent} from "constants/anlytics.constant";
import {GlobalPopupHelper} from "helpers/index";
import navigationHelper from "helpers/navigation.helper";
import {logEventAnalytics, useNativeAds, useSystem} from "helpers/system.helper";
import isEqual from "react-fast-compare";
import {Image, Linking, Pressable, StatusBar, StyleSheet, View} from "react-native";
import {
    AdBadge,
    AdvertiserView,
    CallToActionView,
    HeadlineView,
    IconView,
    NativeMediaView,
    TaglineView
} from "react-native-admob-native-ads";
import FastImage from "react-native-fast-image";
import Animated, {useAnimatedScrollHandler, useSharedValue, withSpring} from "react-native-reanimated";
import {setShouldShowWelcome} from "store/reducer/system.reducer.store";
import {Device} from "ui/device.ui";
import {FontSizes, HS, MHS, VS} from "ui/sizes.ui";
import {SystemTheme} from "ui/theme";
import {randomAppAds} from "constants/system.constant";
import AdsItemList from "components/Ads/ads.itemList";
import NativeAdmob from "components/Ads/nativeAdmob.ads";

const TOTAL_STEP = 3;
const totalWidth = TOTAL_STEP * Device.width;

const data = [
    {
        image: require("assets/images/welcome1.jpg"),
        title: "Search any book you like",
        des: "AI Book"
    },
    {
        image: require("assets/images/welcome2.jpg"),
        title: "View content the way you want\nDetailed or brief, text or audio",
        des: "AI Book"
    },
    {image: require("assets/images/welcome1.jpg"), title: "Enjoy!!!", des: "AI Book"}
];

const WelcomeScreen = () => {
    const {theme, styles} = useSystem(createStyles);
    const scrollViewRef = useRef<Animated.ScrollView>(null);
    const percent = useSharedValue(1 / TOTAL_STEP * 100);
    const indexRef = useRef(1);
    const dispatch = useAppDispatch();
    const [clicked, setClicked] = useState(false)
    const isPremium = useAppSelector(state => state.system.isPremium);

    // function
    const scrollHandler = useAnimatedScrollHandler({
        onEndDrag: (event) => {
            percent.value = withSpring((Device.width + event.contentOffset.x) / totalWidth * 100);
        }
    });

    const onMomentumScrollEnd = (event) => {
        percent.value = withSpring((Device.width + event.nativeEvent.contentOffset.x) / totalWidth * 100);
    };

    const onSkipPress = useCallback(() => {
        dispatch(setShouldShowWelcome(false));
        navigationHelper.replace("DrawerNavigator");
    }, []);

    useEffect(() => {
        GlobalPopupHelper.modalLoadingRef.current?.hide();
    }, []);

    const onContinuePress = useCallback(() => {
        if (indexRef.current == 3) {
            onSkipPress();
            return;
        }
        scrollViewRef.current?.scrollTo({y: 0, x: indexRef.current * Device.width, animated: true});
        indexRef.current += 1;
    }, []);
    // ================================================


    const renderWelcome = useCallback((image, title, des, index) => {
        const nativeAdViewRef = useRef<any>();
        const refShouldReLoadAds = useRef<boolean>(true);
        const {nativeAdsId, use_native_ads} = useNativeAds();
        const [dataAds, setDataAds] = useState<any>();
        const refDataAdsEcosystem = useRef(randomAppAds())

        useEffect(() => {
            if (index === 2 && nativeAdsId && refShouldReLoadAds.current && nativeAdViewRef.current && use_native_ads) {
                refShouldReLoadAds.current = false;
                nativeAdViewRef.current?.loadAd();
            }
        }, [nativeAdsId, use_native_ads]);


        //////////////

        const onAdFailedToLoad = useCallback((error) => {
            if (error && error?.currencyCode?.toUpperCase() != "USD") {
                refShouldReLoadAds.current = true;
            }
        }, []);

        const onNativeAdLoaded = useCallback((data) => {
            setDataAds(data);
        }, []);

        const onAdClickedCurrent = useCallback(() => {
            setClicked(true)
        }, []);

        //////////////

        const renderEcosystemAds = () => {
            return (
                <Pressable
                    onPress={() => {
                        logEventAnalytics(EnumAnalyticEvent.EcosystemAdsClick + "_" + refDataAdsEcosystem.current.name)
                        GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
                        Linking.openURL(refDataAdsEcosystem.current.link);
                    }}
                    style={{paddingHorizontal: HS._12}}>
                    <View style={{flexDirection: "row", marginBottom: VS._8, width: "100%"}}>
                        <FastImage
                            source={typeof refDataAdsEcosystem.current.logo === 'number' ? refDataAdsEcosystem.current.logo : {uri: refDataAdsEcosystem.current.logo}}
                            style={{
                                width: 40,
                                height: 40
                            }}
                            resizeMode={"contain"}
                        />
                        <View style={{flex: 1, marginHorizontal: HS._8, justifyContent: "space-around"}}>
                            <TextBase title={refDataAdsEcosystem.current.title}
                                      style={{fontWeight: "bold", fontSize: 13, color: theme.text}}/>
                            <TextBase title={refDataAdsEcosystem.current.description} numberOfLines={2}
                                      style={{fontSize: 11, color: theme.text}}/>
                        </View>
                    </View>

                    <View style={{width: "100%", flexDirection: "row", justifyContent: "space-between"}}>
                        <FastImage
                            source={typeof refDataAdsEcosystem.current.image[0] === 'number' ? refDataAdsEcosystem.current.image[0] : {uri: refDataAdsEcosystem.current.image[0]}}
                            style={{
                                width: "32.5%",
                                height: Device.height / 3
                            }}
                            resizeMode={"cover"}
                        />
                        <FastImage
                            source={typeof refDataAdsEcosystem.current.image[1] === 'number' ? refDataAdsEcosystem.current.image[1] : {uri: refDataAdsEcosystem.current.image[1]}}
                            style={{
                                width: "32.5%",
                                height: Device.height / 3
                            }}
                            resizeMode={"cover"}
                        />
                        <FastImage
                            source={typeof refDataAdsEcosystem.current.image[1] === 'number' ? refDataAdsEcosystem.current.image[2] : {uri: refDataAdsEcosystem.current.image[2]}}
                            style={{
                                width: "32.5%",
                                height: Device.height / 3
                            }}
                            resizeMode={"cover"}
                        />
                    </View>

                    <View
                        style={{...styles.buttonAds, backgroundColor: theme.btnActive, marginTop: VS._12}}
                    >
                        <TextBase title={"Confirm"} numberOfLines={2}
                                  style={{fontSize: FontSizes._16, color: theme.textLight}}
                                  fontWeight={"bold"}/>
                    </View>
                </Pressable>
            );
        };

        return (
            <View style={styles.containerItem}>
                <View
                    style={{
                        width: "100%",
                        height: Device.height * .2,
                        zIndex: 1,
                        paddingHorizontal: MHS._12,
                        justifyContent: "center",
                        flex: 1
                    }}
                >
                    <TextBase title={des} fontWeight={"900"} fontSize={FontSizes._30}
                              style={{top: Device.heightStatusBar}}/>

                    <TextBase title={title} fontSize={FontSizes._20} style={{marginTop: VS._40}}/>

                    {
                        index == 2 &&
                        <Pressable onPress={onSkipPress}
                                   style={{position: "absolute", right: HS._24, top: Device.heightStatusBar}}>
                            <TextBase title={"Got it"} fontSize={MHS._16} color={theme.text}
                                      style={{textDecorationLine: "underline"}}/>
                        </Pressable>
                    }
                </View>

                <AdsItemList/>
                <View style={{height: VS._12}}/>
                {
                    index !== 2 &&
                    <Image style={{width: Device.width, height: Device.width / (14 / 9), marginBottom: VS._20}}
                           resizeMode={"cover"} source={image}/>

                }

                {
                    (index === 2 && !isPremium) ?
                        ((!clicked && nativeAdsId) ?
                                <NativeAdmob
                                    nameAds={'welcome'}
                                    // style={styles.buttonContinueContainer}
                                    ref={nativeAdViewRef}
                                    adChoicesPlacement="bottomRight"
                                    adUnitID={nativeAdsId}

                                    onAdFailedToLoad={onAdFailedToLoad}
                                    onAdClicked={onAdClickedCurrent}
                                    onNativeAdLoaded={onNativeAdLoaded}
                                >
                                    {
                                        dataAds &&
                                        <>
                                            <View style={{flexGrow: 1, flexShrink: 1, paddingHorizontal: 6}}>
                                                <View style={{flexDirection: "row", alignItems: "center", gap: HS._8}}>
                                                    <IconView style={{width: 40, height: 40}}/>
                                                    <View style={{flex: 1}}>
                                                        <HeadlineView
                                                            style={{
                                                                fontWeight: "bold",
                                                                fontSize: 13,
                                                                color: theme.text
                                                            }}/>
                                                        <TaglineView numberOfLines={2}
                                                                     style={{fontSize: 11, color: theme.text}}/>
                                                    </View>
                                                </View>
                                                <AdvertiserView style={{fontSize: 10, color: "gray"}}/>
                                            </View>
                                            <AdBadge style={{left: Device.width - MHS._30}}/>
                                            <NativeMediaView
                                                style={{
                                                    width: Device.width,
                                                    height: Device.width / (14 / 9),
                                                    marginBottom: VS._20
                                                }}
                                            />

                                            <CallToActionView
                                                style={styles.buttonAds}
                                                buttonAndroidStyle={{
                                                    borderRadius: MHS._15,
                                                    backgroundColor: theme.btnActive
                                                }}
                                                textStyle={{
                                                    color: theme.textLight,
                                                    fontSize: FontSizes._16,
                                                    fontWeight: "700"
                                                }}
                                                allowFontScaling={false}
                                                allCaps
                                            />
                                        </>
                                    }
                                </NativeAdmob>
                                :
                                renderEcosystemAds()
                        )

                        :
                        <View style={styles.skipContainer}>
                            <Pressable onPress={onContinuePress} style={styles.button}>
                                {/*<View />*/}
                                <TextBase title={"Continue"} fontWeight={"700"} color={theme.background}
                                          fontSize={MHS._16}/>
                                {/*<IconRight size={MHS._15} color={theme.background} />*/}
                            </Pressable>
                        </View>
                }

            </View>
        );
    }, [clicked]);

    return (
        <View style={styles.container}>
            <StatusBar translucent barStyle={"dark-content"} backgroundColor={"#00000000"}/>
            {<Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                style={styles.content}
                scrollEventThrottle={16}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onScroll={scrollHandler}
                scrollEnabled={false}
                keyboardShouldPersistTaps="handled"
            >
                {
                    data.map((item, index) => {
                        return (
                            <View style={styles.image} key={item?.title}>
                                {renderWelcome(item?.image, item?.title, item?.des, index)}
                            </View>
                        );
                    })
                }
            </Animated.ScrollView>}
            {/*{renderButton()}*/}
        </View>
    );
};

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#FFFFFF",
            paddingTop: Device.isAndroid ? Device.heightPaddingStatusBar : 0,
            paddingBottom: VS._44
        },
        containerItem: {
            flex: 1,
            width: "100%",
            justifyContent: "space-between"
        },
        content: {
            flex: 1
        },
        buttonContinueContainer: {
            width: Device.width,
            position: "absolute",
            bottom: 0,
            left: 0,
            paddingHorizontal: MHS._24,
            zIndex: 2
        },
        buttonAds: {
            height: MHS._50,
            justifyContent: "center",
            alignItems: "center",
            width: "90%",
            flexDirection: "row",
            alignSelf: "center",
            zIndex: 0.5,
            borderRadius: MHS._15,
            backgroundColor: theme.btnActive
        },
        buttonDoneContainer: {
            width: Device.width,
            // position: "absolute",
            bottom: 0,
            left: 0,
            paddingBottom: MHS._30,
            paddingHorizontal: MHS._24,
            zIndex: 2
        },
        button: {
            width: "90%",
            backgroundColor: theme.btnActive,
            paddingVertical: MHS._15,
            paddingHorizontal: MHS._16,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "center",
            borderRadius: MHS._15,
            zIndex: 0.5,
            height: MHS._50
        },
        skipContainer: {
            marginTop: MHS._10,
            width: "100%",
            alignItems: "flex-end"
        },
        image: {
            width: Device.width,
            flex: 1
        }
    });
};

export default memo(WelcomeScreen, isEqual);
