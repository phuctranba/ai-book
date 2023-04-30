import {appleAuth} from "@invertase/react-native-apple-authentication";
import {GoogleSignin, statusCodes} from "@react-native-google-signin/google-signin";
import {IconApple, IconGoogle} from "assets/svgIcons";
import TextBase from "components/TextBase";
import {APP_URL, IOS_CLIENT_ID_GOOGLE, WEB_CLIENT_ID_GOOGLE} from "configs/index";
import {useAppDispatch, useAppSelector} from "configs/store.config";
import {EnumAnalyticEvent} from "constants/anlytics.constant";
import {NAVIGATION_PREMIUM_SERVICE_SCREEN} from "constants/router.constant";
import {GlobalPopupHelper} from "helpers/index";
import navigationHelper from "helpers/navigation.helper";
import {logEventAnalytics, useDisplayAds, useSystem} from "helpers/system.helper";
import {languages} from "languages";
import * as React from "react";
import {useCallback, useEffect, useRef} from "react";
import {Linking, Pressable, StyleSheet, TouchableOpacity, View} from "react-native";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";
import {clearError, loginWithAppleAccount, loginWithGoogleAccount} from "store/reducer/user.reducer.store";
import {Device} from "ui/device.ui";
import {FontSizes, FontWeights, HS, MHS, VS} from "ui/sizes.ui";
import {SystemTheme} from "ui/theme";
import Animated, {interpolate, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import {setFreeSummaryCount, switchAdsId} from "store/reducer/system.reducer.store";
import NativeAdView, {AdBadge, IconView, HeadlineView, NativeMediaView, CallToActionView, TaglineView} from "react-native-admob-native-ads";
import {HIT_SLOP_EXPAND_20} from "constants/system.constant";

export default function LoginScreen() {
  const {styles, theme} = useSystem(createStyles);

  const dispatch = useAppDispatch();
  const errorMessage = useAppSelector((state) => state.user.errorMessage);
  const isPremium = useAppSelector(state => state.system.isPremium)
  const {displayAlertAds, nativeAdsId, native_ads_login} = useDisplayAds()
  const nativeAdViewRef = useRef<any>()
  const ani = useSharedValue(0);
  const refShouldReLoadAds = useRef<boolean>(true)

  //ads login load 2 lần
  useEffect(() => {
    if (!isPremium && nativeAdsId && refShouldReLoadAds.current && native_ads_login) {
      setTimeout(()=>{
        refShouldReLoadAds.current = false;
        nativeAdViewRef.current?.loadAd();
      },500)
    }
  }, [nativeAdsId, isPremium, native_ads_login])

  useEffect(() => {
    if (errorMessage) {
      GlobalPopupHelper.hideLoading();
      doToastError(errorMessage)
      dispatch(clearError());
    }
  }, [errorMessage]);

  const doToastError = useCallback((text: string) => {
    GlobalPopupHelper.alert({
      type: "error",
      title: "Login Error",
      message: text,
    });
  }, []);

  /**
   * Google SignIn
   *
   */
  const onSignInWithGoogle = async () => {
    dispatch(setFreeSummaryCount(0))
    logEventAnalytics(EnumAnalyticEvent.PressLogin)
    try {
      GlobalPopupHelper.showLoading(false);
      GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID_GOOGLE,
        iosClientId: IOS_CLIENT_ID_GOOGLE,
        offlineAccess: true,
      });
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
      const {idToken} = await GoogleSignin.signIn();
      console.log("idToken", idToken);
      const res: any = await dispatch(loginWithGoogleAccount({user_token: idToken}));
      if (res.payload.data) {
        logEventAnalytics(EnumAnalyticEvent.LoginSuccess)
        onConfirmLogin()
      }
      GlobalPopupHelper.hideLoading();
    } catch (error: any) {
      GlobalPopupHelper.hideLoading();
      console.log(JSON.stringify(error), "error");
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        //doToastError(trans("login_loginCanceled"));
      } else {
        doToastError(languages.somethingWentWrong);
      }
    }
  };

  const onSignInWithApple = async () => {
    dispatch(setFreeSummaryCount(0))
    logEventAnalytics(EnumAnalyticEvent.PressLogin)
    GlobalPopupHelper.showLoading()
    try {
      GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      // Get User status Signup
      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
      // onCredentialRevoked returns a function that will remove the event listener. useEffect will call this function when the component unmounts
      if (credentialState === appleAuth.State.AUTHORIZED) {
        let {identityToken, fullName} = appleAuthRequestResponse;

        if (identityToken) {
          // if user is authenticated dispatch to server
          const res: any = await dispatch(loginWithAppleAccount({
            user_token: identityToken,
            full_name: fullName?.nickname || `${fullName?.givenName || ""} ${fullName?.familyName || ""}`.trim()
          }));
          if (res.payload.data) {
            logEventAnalytics(EnumAnalyticEvent.LoginSuccess)
            GlobalPopupHelper.hideLoading();
            onConfirmLogin()
          }
        } else {
          GlobalPopupHelper.hideLoading();
          doToastError(languages.somethingWentWrong);
        }
      } else {
        GlobalPopupHelper.hideLoading();
      }
    } catch (err) {
      GlobalPopupHelper.hideLoading();
    }
    return;
  }

  const OpenURLButton = useCallback(({url, children}) => {
    const handlePress = useCallback(async () => {
      // Checking if the link is supported for links with custom URL scheme.
      try {
        await Linking.openURL(url);
      } catch (error) {
      }
    }, [url]);

    return (
        <TextBase onPress={handlePress} style={styles.linkText} fontWeight="700">
          {children}
        </TextBase>
    );
  }, []);

  const onSignInWithoutLogin = () => {
    dispatch(setFreeSummaryCount(0))
    logEventAnalytics(EnumAnalyticEvent.PressWithoutLogin)
    if (isPremium) {
      onConfirmLogin()
      return;
    }
    displayAlertAds({
      title: languages.loginScreen.youAreNotLogin,
      message: languages.loginScreen.watchAdsLogin,
      callback: () => {
        logEventAnalytics(EnumAnalyticEvent.WithoutLoginSuccess)
        onConfirmLogin()
      }
    })
  }

  const onConfirmLogin = () => {
    if (isPremium) {
      navigationHelper.replace("DrawerNavigator")
    } else {
      navigationHelper.replace(NAVIGATION_PREMIUM_SERVICE_SCREEN)
    }
  }

  //////////////

  const onAdFailedToLoad = useCallback((error) => {
    if (!(error.code == 0 && error.currencyCode == "USD")) {
      logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad+"login")
      console.log(EnumAnalyticEvent.NativeAdsFailedToLoad+"login")
      console.log("Call switchAdsId login")
      dispatch(switchAdsId("native"))
      refShouldReLoadAds.current = true;
    }
  },[])

  const onNativeAdLoaded = useCallback((data) => {
    logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded+"login")
    console.log(EnumAnalyticEvent.onNativeAdsLoaded+"login")
    ani.value = withTiming(1, {duration: 1000})
  },[])

  const onAdClicked = useCallback(() => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked+"login")
    console.log(EnumAnalyticEvent.NativeAdsClicked+"login")
  }, [])

  const onAdImpression = useCallback(() => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsImpression+"login")
    console.log(EnumAnalyticEvent.NativeAdsImpression+"login")
  }, [])

  const onAdOpened = useCallback(() => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsOpened+"login")
    console.log(EnumAnalyticEvent.NativeAdsOpened+"login")
  }, [])

  const onAdLeftApplication = useCallback(() => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsLeftApplication+"login")
    console.log(EnumAnalyticEvent.NativeAdsLeftApplication+"login")
  }, [])

  const onAdClosed = useCallback(() => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsClosed+"login")
    console.log(EnumAnalyticEvent.NativeAdsClosed+"login")
  }, [])

  const onAdLoaded = useCallback(() => {
    logEventAnalytics(EnumAnalyticEvent.NativeAdsLoaded+"login")
    console.log(EnumAnalyticEvent.NativeAdsLoaded+"login")
  }, [])

  //////////////

  const aniAds = useAnimatedStyle(() => {
    return ({
      height: interpolate(ani.value, [0, 1], [0, VS._200])
    })
  }, [])

  return (
      <LinearGradient
          style={styles.container}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={["#e3f0eb", "#319875"]}
      >
        <View style={styles.scrollView}>
          <View style={{alignSelf: "center"}}>
            <FastImage
                source={require("assets/images/logo.png")}
                style={{width: MHS._100, height: MHS._100, borderRadius: MHS._16, alignSelf: "center"}}
            />
            <Pressable style={{marginTop: VS._10, alignItems: "center"}}>
              <TextBase textAlign="center">
                <TextBase title="Powered by" fontSize={20} color={theme.textDark} fontWeight="600"/>
                <TextBase title={` ${Device.isIos ? "AI CHAT BOT" : "OPEN AI"}`} fontSize={20}
                          color={theme.textMain} fontWeight="600"/>
              </TextBase>
            </Pressable>
          </View>


          <View style={styles.viewBtn}>
            <TouchableOpacity style={[styles.btnLogin]} onPress={onSignInWithGoogle}>
              <IconGoogle width={HS._20} height={HS._20} style={styles.logoSSO}/>
              <TextBase fontWeight={"700"} color={theme.textDark} title={languages.loginScreen.loginGoogle}/>
            </TouchableOpacity>
            {Device.isIos && (
                <TouchableOpacity style={[styles.btnLogin, {backgroundColor: "black"}]}
                                  onPress={onSignInWithApple}>
                  <IconApple width={HS._20} height={HS._20} style={styles.logoSSO}/>
                  <TextBase fontWeight={"600"} color={theme.textLight}
                            title={languages.loginScreen.loginApple}/>
                </TouchableOpacity>
            )}

            <TextBase fontWeight={"600"}
                      color={theme.textDark}
                      fontSize={FontSizes._20}
                      title={languages.loginScreen.or}
                      style={styles.or}/>

            {!isPremium && <View style={{overflow: 'hidden'}}>
              <Animated.View style={[styles.viewAds, aniAds]}>
                <NativeAdView
                    onNativeAdLoaded={onNativeAdLoaded}
                    style={styles.nativeAdsContainer}
                    ref={nativeAdViewRef}
                    adChoicesPlacement="topRight"
                    adUnitID={nativeAdsId}
                    onAdFailedToLoad={onAdFailedToLoad}
                    onAdClicked={onAdClicked}
                    onAdImpression={onAdImpression}
                    onAdOpened={onAdOpened}
                    onAdLeftApplication={onAdLeftApplication}
                    onAdClosed={onAdClosed}
                    onAdLoaded={onAdLoaded}
                    videoOptions={{
                      muted: true
                    }}
                >
                  <View style={{flexGrow: 1, flexShrink: 1, paddingHorizontal: HS._16}}>
                    <AdBadge textStyle={{color: theme.textDark}} style={{borderColor: theme.textDark}}/>
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: HS._8,
                      marginBottom: MHS._6
                    }}>
                      <IconView style={{width: MHS._40, height: MHS._40}}/>
                      <View style={{flex: 1}}>
                        <HeadlineView
                            style={{fontWeight: 'bold', fontSize: 13, color: theme.textDark}}/>
                        <TaglineView numberOfLines={2}
                                     style={{fontSize: 11, color: theme.textDark}}/>
                      </View>
                    </View>
                  </View>
                  <NativeMediaView style={{width: Device.width - HS._48, height: VS._110}}/>

                  <CallToActionView
                      style={{...styles.buttonAds, backgroundColor: theme.btnLight}}
                      textStyle={{
                        color: theme.textDark,
                        fontSize: FontSizes._16,
                        ...FontWeights.Bold_600_SVN
                      }}
                      buttonAndroidStyle={{...styles.buttonAds, backgroundColor: theme.btnLight}}
                      allowFontScaling={false}
                      allCaps
                  />
                </NativeAdView>
              </Animated.View>
            </View>}


            <TouchableOpacity onPress={onSignInWithoutLogin} hitSlop={HIT_SLOP_EXPAND_20}>
              <TextBase fontWeight={"600"} color={theme.textDark}
                        title={languages.loginScreen.acceptWithoutLogin} style={styles.textDes}/>
            </TouchableOpacity>
          </View>
        </View>

        <TextBase style={styles.policyText} fontWeight={"400"} fontSize={14} color={theme.textDark}>
          {languages.loginScreen.description}<OpenURLButton
            url={APP_URL.TERM}>{languages.loginScreen.termConditions}</OpenURLButton>{" "}
          {languages.loginScreen.and} <OpenURLButton
            url={APP_URL.POLICIES}>{languages.loginScreen.privacyPolicy}</OpenURLButton> {languages.loginScreen.our}
        </TextBase>
      </LinearGradient>
  );
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      justifyContent: "center",
      paddingTop: Device.heightStatusBar,
    },
    btnLogin: {
      width: Device.width - 32,
      borderRadius: MHS._16,
      paddingVertical: VS._14,
      paddingHorizontal: HS._16,
      marginHorizontal: HS._16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: VS._8,
      backgroundColor: theme.btnLight
    },
    btnLoginApple: {
      width: Device.width - 32,
      borderRadius: MHS._50,
      paddingVertical: VS._12,
      paddingHorizontal: HS._16,
      marginHorizontal: HS._16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: VS._6,
      backgroundColor: "black",
    },
    txtJoin: {
      width: "75%",
      color: "#fff",
      fontSize: FontSizes._22,
      marginBottom: VS._20,
      ...FontWeights.Bold_600_SVN,
    },
    linkText: {
      color: theme.textDark,
    },
    policyText: {
      width: "100%",
      textAlign: "center",
      paddingHorizontal: HS._16,
      marginBottom: Device.paddingBottom
    },
    viewBtn: {
      width: "100%",
      alignItems: "center",
      // paddingVertical: VS._32,
    },
    imageHello: {
      alignSelf: 'center',
      width: "40%",
      // height: VS._240,
      marginTop: VS._20,
      marginHorizontal: "10%",
    },
    logoSSO: {
      marginRight: HS._8
    },
    or: {
      marginBottom: VS._18
    },
    textDes: {
      textDecorationLine: "underline",
      marginTop: VS._16
    },
    buttonAds: {
      width: Device.width - 32,
      marginTop: VS._6,
      height: HS._42,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: MHS._16
    },
    viewAds: {},
    nativeAdsContainer: {
      width: "100%",
      height: VS._200,
    },
  });
};
