import TextBase from "components/TextBase";
import { logEventAnalytics, useNativeAds, useSystem } from "helpers/system.helper";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Device } from "ui/device.ui";
import { FontSizes, FontWeights, HS, MHS, VS } from "ui/sizes.ui";
import { RootColor, SystemTheme } from "ui/theme";
import { useAppDispatch, useAppSelector } from "configs/store.config";
import NativeAdView, {
  AdBadge,
  CallToActionView,
  HeadlineView,
  IconView,
  TaglineView
} from "react-native-admob-native-ads";
import { randomAppAds } from "constants/system.constant";
import { EnumAnalyticEvent } from "constants/anlytics.constant";
import { GlobalPopupHelper } from "helpers/index";
import {setIsReceivedAWelcomeGift, setStateToImpression} from "store/reducer/system.reducer.store";
import LottieView from "lottie-react-native";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import NativeAdmob from "components/Ads/nativeAdmob.ads";


const GiftFirstOpenScreen = ({}, ref) => {
  const { styles, theme } = useSystem(createStyles);
  const dispatch = useAppDispatch();
  const isReceivedAWelcomeGift = useAppSelector(state => state.system.isReceivedAWelcomeGift);
  const shouldShowWelcome = useAppSelector(state => state.system.shouldShowWelcome);
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["100%"], []);
  const refIsCallOneTime = useRef(false)
  const refCb = useRef<Function|undefined>();
  const [isReadyToHome] = useState(shouldShowWelcome)


  useImperativeHandle(ref, () => ({
    show: () => {
      sheetRef.current?.snapToIndex(0);
      logEventAnalytics("show_gift_new_user");
      setTimeout(() => dispatch(setStateToImpression({})), 500);
    }
  }));

  const onGetIt = useCallback(() => {
    sheetRef.current?.close();
  }, []);


  const onClose = useCallback(() => {
    console.log('call onClose GiftFirstOpenScreen')
    if(refIsCallOneTime.current){
      dispatch(setIsReceivedAWelcomeGift());
      GlobalPopupHelper.alert({
        type: "success",
        message: "You have successfully received 3 book summaries"
      });

      refCb.current?.()
    }else {
      refIsCallOneTime.current = true
    }
  }, []);


  if (isReceivedAWelcomeGift || isReadyToHome)
    return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      handleComponent={null}
      backgroundStyle={{ backgroundColor: "transparent" }}
      keyboardBlurBehavior={"none"}
      onClose={onClose}
      enablePanDownToClose
      animateOnMount={false}
    >
      <View style={styles.container}>
        <View style={styles.containerContent}>
          <View style={styles.containerGreen}>
            <View style={{
              flexDirection: "row",
              position: "absolute",
              justifyContent: "space-between",
              width: "100%",
              top: -MHS._16
            }}>
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
            </View>

            <LottieView
              source={require("assets/lotties/bomb.json")}
              autoPlay
              style={{ width: MHS._120, height: MHS._120, position: "absolute", top: -MHS._20, left: HS._12 }}
            />
            <LottieView
              source={require("assets/lotties/gifrFree.json")}
              autoPlay
              style={{ width: MHS._200, height: MHS._200, position: "absolute", top: -MHS._50, right: -HS._24 }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: HS._12 }}>
              <TextBase style={{ fontSize: 100, color: RootColor.PremiumColor, fontWeight: "bold" }} title={"3"} />
              <View>
                <TextBase style={{ fontSize: 20, color: theme.textLight, fontWeight: "bold" }} title={" free"} />
                <TextBase style={{ fontSize: 20, color: theme.textLight, fontWeight: "bold" }} title={" questions"} />
                <TextBase style={{ fontSize: 20, color: theme.textLight, fontWeight: "bold" }}
                          title={" for new user"} />
              </View>
            </View>

            <LottieView
              source={require("assets/lotties/welcome.json")}
              autoPlay
              style={{ height: VS._140, position: "absolute", bottom: 0 }}
            />

            <TextBase title={"GET IT!"}
                      onPress={onGetIt}
                      style={{
                        color: theme.textLight,
                        marginRight: HS._12,
                        fontSize: 16,
                        bottom: -VS._36,
                        fontWeight: "bold", textDecorationLine: "underline", textAlign: "right"
                      }} />

          </View>
          <View style={styles.containerAdmob}>
            <View style={{
              flexDirection: "row",
              position: "absolute",
              justifyContent: "space-between",
              width: "100%",
              top: -MHS._12
            }}>
              <View style={[styles.viewCircle, { left: -MHS._12 }]} />
              <View style={[styles.viewCircle, { right: -MHS._12 }]} />
            </View>
            <AdmobNativeGift />
            <View style={{
              flexDirection: "row",
              position: "absolute",
              justifyContent: "space-between",
              width: "100%",
              bottom: -MHS._16
            }}>
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
              <View style={styles.viewCircle} />
            </View>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};

const WIDTH = Math.min(Device.width - HS._32, Device.width - 16);

const AdmobNativeGift = () => {
  const { styles, theme } = useSystem(createStyles);
  const { nativeAdsId, use_native_ads } = useNativeAds();
  const nativeAdViewRef = useRef<NativeAdView>(null);
  const [dataAds, setDataAds] = useState<any>();
  const [clicked, setClicked] = useState(false);
  const refDataAdsEcosystem = useRef(randomAppAds());
  const refTimeCheck = useRef(new Date().getTime());

  useEffect(() => {
    if (nativeAdsId && use_native_ads) {
      setTimeout(() => {
        logEventAnalytics(EnumAnalyticEvent.onNativeCallLoaded + "gift_new_user");
        console.log(EnumAnalyticEvent.onNativeCallLoaded + "gift_new_user");
        refTimeCheck.current = new Date().getTime();
        nativeAdViewRef.current?.loadAd();
      }, 0);
    }
  }, [nativeAdsId, use_native_ads]);

  //////////////

  const onNativeAdLoaded = useCallback((data) => {
    logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "gift_new_user" + data.video.toString() + "_" + Math.round((new Date().getTime() - refTimeCheck.current) / 1000));
    logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "gift_new_user" + data.video.toString());
    setDataAds(data);
  }, []);

  const onAdClicked = useCallback(() => {
    setClicked(true);
  }, []);

  const onAdLoaded = useCallback(() => {
    logEventAnalytics("call_to_impression_gift_new_user");
  }, []);

  if (clicked) {
    return (
      <Pressable
        onPress={() => {
          logEventAnalytics(EnumAnalyticEvent.EcosystemAdsClick + "_" + refDataAdsEcosystem.current.name);
          GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
          Linking.openURL(refDataAdsEcosystem.current.link);
        }}
      >
        <View style={{ flexDirection: "row", marginVertical: VS._8, width: "100%", paddingHorizontal: HS._8 }}>
          <FastImage
            source={refDataAdsEcosystem.current.logo}
            style={{
              width: MHS._40,
              height: MHS._40
            }}
            resizeMode={"contain"}
          />
          <View style={{ flex: 1, marginLeft: HS._6, justifyContent: "space-around" }}>
            <TextBase title={refDataAdsEcosystem.current.title}
                      style={{ fontWeight: "bold", fontSize: 13, color: theme.text }} />
            <TextBase title={refDataAdsEcosystem.current.description} numberOfLines={2}
                      style={{ fontSize: 11, color: theme.text }} />
          </View>
        </View>

        <View
          style={{ ...styles.buttonAds, backgroundColor: theme.btnActive, alignSelf: "center", marginTop: VS._6 }}
        >
          <TextBase title={"Confirm"} numberOfLines={2} style={{ fontSize: 16, color: theme.textLight }}
                    fontWeight={"bold"} />
        </View>
      </Pressable>
    );
  }

  //////////////

  return (
    <NativeAdmob
        nameAds={"gift_new_user"}
      adUnitID={nativeAdsId}
      style={{ width: "100%", paddingBottom: MHS._12 }}
      ref={nativeAdViewRef}
      adChoicesPlacement={"bottomRight"}
      videoOptions={{
        muted: true
      }}
      onAdClicked={onAdClicked}
      onNativeAdLoaded={onNativeAdLoaded}
      onAdLoaded={onAdLoaded}
    >
      {
        dataAds ? (
          <>
            <View style={{ flexGrow: 1, flexShrink: 1, paddingHorizontal: HS._8, marginBottom: VS._12 }}>
              <AdBadge />
              <View style={{ flexDirection: "row", alignItems: "center", marginVertical: VS._8 }}>
                <IconView style={{ width: MHS._40, height: MHS._40 }} />
                <View style={{ flex: 1, marginLeft: HS._6 }}>
                  <HeadlineView style={{ fontWeight: "bold", fontSize: FontSizes._13, color: theme.text }} />
                  <TaglineView numberOfLines={2} style={{ fontSize: FontSizes._11, color: theme.text }} />
                </View>
              </View>
            </View>

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
    </NativeAdmob>
  );
};

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: `${RootColor.DarkBackground}70`
    },
    containerContent: {
      backgroundColor: RootColor.DarkBackground,
      paddingHorizontal: HS._16,
      paddingVertical: MHS._16,
      borderRadius: MHS._16
    },
    containerGreen: {
      backgroundColor: `${RootColor.MainColor}30`,
      borderRadius: MHS._16,
      paddingTop: MHS._12,
      paddingBottom: VS._100
    },
    containerAdmob: {
      paddingVertical: MHS._36,
      backgroundColor: theme.textLight,
      width: Device.width * 0.8,
      borderRadius: MHS._16
    },
    buttonAds: {
      width: "80%",
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: MHS._16
    },
    viewCircle: {
      width: MHS._24,
      height: MHS._24,
      borderRadius: MHS._24,
      backgroundColor: RootColor.DarkBackground
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

export default forwardRef(GiftFirstOpenScreen);
