import TextBase from "components/TextBase";
import { useAppDispatch } from "configs/store.config";
import { logEventAnalytics, useDisplayAds, useSystem } from "helpers/system.helper";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { Image, Pressable, StatusBar, StyleSheet, View } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue, withSpring } from "react-native-reanimated";
import {setShouldShowWelcome, switchAdsId} from "store/reducer/system.reducer.store";
import { Device } from "ui/device.ui";
import { FontSizes, HS, MHS, VS } from "ui/sizes.ui";
import { SystemTheme } from "ui/theme";
import NativeAdView, {
  AdBadge,
  AdvertiserView,
  CallToActionView,
  HeadlineView,
  IconView,
  NativeMediaView,
  TaglineView
} from "react-native-admob-native-ads";
import navigationHelper from "helpers/navigation.helper";
import { EnumAnalyticEvent } from "constants/anlytics.constant";
import { GlobalPopupHelper } from "helpers/index";
import {NAVIGATION_HISTORY} from "constants/router.constant";

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
  { image: require("assets/images/welcome1.jpg"), title: "Enjoy!!!", des: "AI Book" }
];

const WelcomeScreen = () => {
  const { theme, styles } = useSystem(createStyles);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const percent = useSharedValue(1 / TOTAL_STEP * 100);
  const indexRef = useRef(1);

  const dispatch = useAppDispatch();

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
    navigationHelper.replace(NAVIGATION_HISTORY);
  }, []);

  const onContinuePress = useCallback(() => {
    if (indexRef.current == 3) {
      onSkipPress();
      return;
    }
    scrollViewRef.current?.scrollTo({ y: 0, x: indexRef.current * Device.width, animated: true });
    indexRef.current += 1;
  }, []);
  // ================================================


  const renderWelcome = useCallback((image, title, des, index) => {
    const nativeAdViewRef = useRef<any>();
    const refShouldReLoadAds = useRef<boolean>(true);
    const { nativeAdsId, use_native_ads } = useDisplayAds();
    const [dataAds, setDataAds] = useState<any>();

    useEffect(() => {
      if (index === 2 && nativeAdsId && refShouldReLoadAds.current && nativeAdViewRef.current && use_native_ads) {
        refShouldReLoadAds.current = false;
        nativeAdViewRef.current?.loadAd();
      }
    }, [nativeAdsId, use_native_ads]);


    //////////////

    const onAdFailedToLoad = useCallback((error) => {
      GlobalPopupHelper.modalLoadingRef.current?.hide();
      if (!(error.code == 0 && error.currencyCode == "USD")) {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad + "welcome");
        console.log(EnumAnalyticEvent.NativeAdsFailedToLoad + "welcome");
        console.log("Call switchAdsId welcome");
        dispatch(switchAdsId("native"));
        refShouldReLoadAds.current = true;
      }
    }, []);

    const onNativeAdLoaded = useCallback((data) => {
      GlobalPopupHelper.modalLoadingRef.current?.hide();
      logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "welcome");
      console.log(EnumAnalyticEvent.onNativeAdsLoaded + "welcome");
      setDataAds(data);
    }, []);

    const onAdClickedCurrent = useCallback(() => {
      logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked + "welcome");
      console.log(EnumAnalyticEvent.NativeAdsClicked + "welcome");
    }, []);

    const onAdImpression = useCallback(() => {
      logEventAnalytics(EnumAnalyticEvent.NativeAdsImpression + "welcome");
      console.log(EnumAnalyticEvent.NativeAdsImpression + "welcome");
    }, []);

    const onAdOpened = useCallback(() => {
      logEventAnalytics(EnumAnalyticEvent.NativeAdsOpened + "welcome");
      console.log(EnumAnalyticEvent.NativeAdsOpened + "welcome");
    }, []);

    const onAdLeftApplication = useCallback(() => {
      logEventAnalytics(EnumAnalyticEvent.NativeAdsLeftApplication + "welcome");
      console.log(EnumAnalyticEvent.NativeAdsLeftApplication + "welcome");
    }, []);

    const onAdClosed = useCallback(() => {
      logEventAnalytics(EnumAnalyticEvent.NativeAdsClosed + "welcome");
      console.log(EnumAnalyticEvent.NativeAdsClosed + "welcome");
    }, []);

    const onAdLoaded = useCallback(() => {
      logEventAnalytics(EnumAnalyticEvent.NativeAdsLoaded + "welcome");
      console.log(EnumAnalyticEvent.NativeAdsLoaded + "welcome");
    }, []);

    //////////////

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
          <TextBase title={"AI Book"} fontWeight={"900"} fontSize={FontSizes._32}
                    style={{ top: Device.heightStatusBar * 2}} />

          <TextBase title={title} fontSize={FontSizes._22} style={{ marginTop: VS._60 }} />

          {
            index == 2 &&
            <Pressable onPress={onSkipPress}
                       style={{ position: "absolute", right: HS._24, top: Device.heightStatusBar }}>
              <TextBase title={"Got it"} fontSize={MHS._16} color={theme.iconDark} style={{textDecorationLine:'underline'}} />
            </Pressable>
          }
        </View>

        {/*<Image style={styles.image} resizeMode={'cover'} source={image}/>*/}
        {
          index !== 2 &&
          <Image style={{ width: Device.width, height: Device.width / (14 / 9), marginBottom: VS._20 }}
                 resizeMode={"cover"} source={image} />

        }

        {
          (index === 2) ?
            <NativeAdView
              // style={styles.buttonContinueContainer}
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
            >
              {
                dataAds &&
                <>
                  <View style={{ flexGrow: 1, flexShrink: 1, paddingHorizontal: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: HS._8 }}>
                      <IconView style={{ width: 40, height: 40 }} />
                      <View style={{ flex: 1 }}>
                        <HeadlineView
                          style={{ fontWeight: "bold", fontSize: 13, color: theme.text }} />
                        <TaglineView numberOfLines={2} style={{ fontSize: 11, color: theme.text }} />
                      </View>
                    </View>
                    <AdvertiserView style={{ fontSize: 10, color: "gray" }} />
                  </View>
                  <AdBadge style={{ left: Device.width - MHS._30 }} />
                  <NativeMediaView
                    style={{
                      width: Device.width, height: Device.width / (14 / 9), marginBottom: VS._20
                    }}
                  />

                  <CallToActionView
                    style={{
                      height: MHS._50,
                      justifyContent: "center",
                      alignItems: "center",
                      width: "90%",
                      flexDirection: "row",
                      alignSelf: "center",
                      zIndex: 0.5,
                      borderRadius: MHS._15,
                      backgroundColor: theme.btnActive
                    }}
                    buttonAndroidStyle={{
                      borderRadius: MHS._15,
                      backgroundColor: theme.btnActive
                    }}
                    textStyle={{
                      color: theme.background,
                      fontSize: FontSizes._16,
                      fontWeight: "700"
                    }}
                    allowFontScaling={false}
                    allCaps
                  />
                </>
              }
            </NativeAdView>
            :
            <View style={styles.skipContainer}>
              <Pressable onPress={onContinuePress} style={styles.button}>
                {/*<View />*/}
                <TextBase title={"Continue"} fontWeight={"700"} color={theme.background}
                          fontSize={MHS._16} />
                {/*<IconRight size={MHS._15} color={theme.background} />*/}
              </Pressable>
            </View>
        }

      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar translucent barStyle={"dark-content"} backgroundColor={"#00000000"} />
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
      backgroundColor: theme.background,
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
