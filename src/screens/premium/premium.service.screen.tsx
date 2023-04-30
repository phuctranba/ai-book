import appleAuth from '@invertase/react-native-apple-authentication'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { useIsFocused } from "@react-navigation/native"
import { IconCheck, IconFilm } from 'assets/svgIcons'
import TextBase from 'components/TextBase'
import { IOS_CLIENT_ID_GOOGLE, WEB_CLIENT_ID_GOOGLE } from 'configs/index'
import { useAppDispatch, useAppSelector } from 'configs/store.config'
import { EnumAnalyticEvent } from 'constants/anlytics.constant'
import { EnumTheme, HIT_SLOP_EXPAND_10 } from 'constants/system.constant'
import { GlobalPopupHelper } from 'helpers/index'
import navigationHelper from 'helpers/navigation.helper'
import { usePurchase } from 'helpers/purchase.helper'
import {
    PRODUCTS,
    SUBSCRIPTIONS,
    SUBSCRIPTIONS_VN,
    logEventAnalytics,
    openURLWebView,
    useDisplayAds,
    useSystem
} from 'helpers/system.helper'
import { languages } from 'languages'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { ScrollView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { clearListChat } from 'store/reducer/home.reducer.store'
import {
    setFreeSummaryCount,
    setIsPremiumTrial,
    setSubscriptionIds,
    setSubscriptionsLocal
} from 'store/reducer/system.reducer.store'
import { loginWithAppleAccount, loginWithGoogleAccount } from 'store/reducer/user.reducer.store'
import { Device } from 'ui/device.ui'
import { FontSizes, HS, MHS, VS } from 'ui/sizes.ui'
import { SystemTheme } from 'ui/theme'

const PremiumServiceScreen = () => {
    const { theme, styles, themeKey } = useSystem(createStyles)
    const safeArea = useSafeAreaInsets()
    const [loading, setLoading] = useState(true)
    const dispatch = useAppDispatch()
    const initTimeout = useRef(true)
    const { displayAlertAds, free_message_of_ads } = useDisplayAds()
    const { isAuthenticated } = useAppSelector(state => state.user)
    const { subscriptionIds, subscriptionsLocal } = useAppSelector(state => state.system)
    const isFocus = useIsFocused()
    const { initIAP, subscriptions, buySubscription } = usePurchase(isFocus)

    useEffect(() => {
        if (subscriptionIds.length == 0) {
            const systemLanguage = languages.getInterfaceLanguage()
            const subIds = systemLanguage.toLowerCase().includes("vi") ? SUBSCRIPTIONS_VN : SUBSCRIPTIONS
            dispatch(setSubscriptionIds(subIds))
            initStore(subIds)
        } else {
            initStore(subscriptionIds)
        }
    }, [])

    const initStore = (ids) => {
        initIAP({ subscriptionIds: ids, productIds: PRODUCTS })
        setTimeout(() => {
            if (initTimeout.current) {
                initIAP({ subscriptionIds: ids, productIds: PRODUCTS })
            }
        }, 2000);
    }

    useEffect(() => {
        if (subscriptionsLocal.length > 0) {
            initTimeout.current = false
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (subscriptions.length > 0) {
            dispatch(setSubscriptionsLocal(subscriptions))
            initTimeout.current = false
            setLoading(false)
        }
    }, [subscriptions])

    // ======================================

    const renderRow = useCallback((title, border = true) => {
        return (
            <View style={[styles.flexRow, border ? {
                borderBottomColor: theme.btnLight,
                borderBottomWidth: StyleSheet.hairlineWidth
            } : {}]}>
                <View style={{ padding: MHS._2, backgroundColor: theme.btnActive, borderRadius: MHS._20 }}>
                    <IconCheck size={MHS._18} color={theme.textLight} />
                </View>
                <TextBase title={title} />
            </View>
        )
    }, [])

    const doToastError = (text) => {
        GlobalPopupHelper.alert({
            type: "error",
            message: text
        })
    }

    const onSignInWithGoogle = async () => {
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
            const { idToken } = await GoogleSignin.signIn();
            console.log("idToken", idToken);
            const res: any = await dispatch(loginWithGoogleAccount({ user_token: idToken }));
            if (res.payload.data) {
                logEventAnalytics(EnumAnalyticEvent.LoginSuccess)
                dispatch(clearListChat())
                onConfirmGet()
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
                let { identityToken, fullName } = appleAuthRequestResponse;

                if (identityToken) {
                    // if user is authenticated dispatch to server
                    const res: any = await dispatch(loginWithAppleAccount({
                        user_token: identityToken,
                        full_name: fullName?.nickname || `${fullName?.givenName || ""} ${fullName?.familyName || ""}`.trim()
                    }));
                    if (res.payload.data) {
                        logEventAnalytics(EnumAnalyticEvent.LoginSuccess)
                        dispatch(clearListChat())
                        onConfirmGet()
                    }
                } else {
                    GlobalPopupHelper.hideLoading();
                }
            } else {
                GlobalPopupHelper.hideLoading();
            }
        } catch (err) {
            GlobalPopupHelper.hideLoading();
        }
        return;
    }

    const onPressGet = useCallback(() => {
        if (!isAuthenticated) {
            const actions = Device.isIos ? [{
                text: languages.premiumScreen.loginGoogle,
                onPress: onSignInWithGoogle,
                active: true
            }, {
                text: languages.premiumScreen.loginApple,
                onPress: onSignInWithApple,
                active: true
            }] : [{
                text: languages.premiumScreen.loginGoogle,
                onPress: onSignInWithGoogle,
                active: true
            }]
            GlobalPopupHelper.alertRef.current?.alert({
                title: languages.premiumScreen.purchase,
                message: languages.premiumScreen.needLoginToPurchase,
                actions
            })
            return;
        }
        // GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
        onConfirmGet()
    }, [isAuthenticated, subscriptionsLocal])

    const onConfirmGet = useCallback(() => {
        if (subscriptionsLocal?.[0]) {
            buySubscription(subscriptionsLocal?.[0])
        }
    }, [subscriptionsLocal])

    const onPressPrivacy = useCallback(() => {
        openURLWebView(`https://www.freeprivacypolicy.com/live/edc280a1-a4ae-4c8b-93b0-a1c32ee6710d`)
    }, [])

    const renderItemPackage = (item) => {
        return (
            <View key={item.productId} style={[styles.packageItem]}>
                <TextBase title={languages.premiumScreen.autoRenew} color={theme.textInactive} fontSize={12} />
                <TextBase title={item.description || `${item.localizedPrice}/${item.subscriptionPeriodUnitIOS}`}
                    fontWeight="700" fontSize={16} style={{ marginTop: VS._6 }} />
            </View>
        )
    }

    const onPressFreeTrial = () => {
        logEventAnalytics(EnumAnalyticEvent.TrialPremium)
        displayAlertAds({
            title: languages.unlockPremiumFeature,
            message: languages.premiumScreen.watchAdsOneDayPremium,
            callback: () => {
                navigationHelper.replace("DrawerNavigator")
                dispatch(setIsPremiumTrial({ overWord: new Date().toISOString() }))
                dispatch(setFreeSummaryCount(Number(free_message_of_ads)))
            }
        })
    }

    const onPressSkip = () => {
        navigationHelper.replace("DrawerNavigator")
    }

    return (
        <View style={styles.container}>
            <View style={styles.imageHeader}>
                <Pressable style={[styles.header, { top: safeArea.top + VS._10 }]}
                    onPress={onPressSkip}>
                    <TextBase title={languages.skip} fontWeight="bold" />
                </Pressable>
            </View>
            <ScrollView style={styles.content} contentContainerStyle={{ alignItems: "center" }}
                showsVerticalScrollIndicator={false}>
                <FastImage
                    source={require("assets/images/logo.png")}
                    style={{ width: MHS._60, height: MHS._60, borderRadius: MHS._16 }}
                />
                {/* <TextBase style={{marginTop: VS._10}}>
                    <TextBase title={NAME_CHAT_GPT} fontSize={MHS._24} fontWeight="900" color={theme.backgroundMain}/>
                </TextBase> */}

                <TextBase title={languages.premiumScreen.premiumDescription} fontSize={MHS._14} textAlign={"center"}
                    style={{ marginTop: VS._10 }} />
                <View style={styles.contentView}>
                    {renderRow(languages.premiumScreen.noAds)}
                    {renderRow(languages.premiumScreen.bestGPTModel)}
                    {renderRow(languages.premiumScreen.voiceFeature)}
                    {/* {renderRow(languages.premiumScreen.speechFeature)} */}
                    {renderRow(languages.premiumScreen.unlimitedAnswer)}
                    {renderRow(languages.premiumScreen.faster, false)}
                </View>
                {
                    subscriptionsLocal.map(i => renderItemPackage(i))
                }
                <TouchableOpacity onPress={onPressGet} style={styles.buttonGet}>
                    {
                        loading ? (
                            <ActivityIndicator size={"large"} color={theme.textMain} />
                        ) : (
                            <TextBase title={languages.premiumScreen.register}
                                color={themeKey == EnumTheme.Dark ? theme.textDark : theme.textLight}
                                fontSize={16} fontWeight="600" />
                        )
                    }
                </TouchableOpacity>
                <Pressable style={[styles.buttonGet, {
                    paddingVertical: VS._14,
                    backgroundColor: theme.btnActive,
                    flexDirection: 'row'
                }]} hitSlop={HIT_SLOP_EXPAND_10} onPress={onPressFreeTrial}>
                    <IconFilm size={FontSizes._18} color={theme.text} />
                    <TextBase title={"  " + languages.premiumScreen.oneDayPremium} fontWeight="600" fontSize={13} />
                </Pressable>
                {
                    Device.isIos ? (
                        <TextBase
                            title={languages.premiumScreen.des2IOS}
                            fontSize={12}
                            style={{ textAlign: "center", marginTop: VS._10 }}
                            color={theme.text}
                        />
                    ) : null
                }
            </ScrollView>
            <View style={[styles.footer, { paddingBottom: Device.paddingBottom }]}>
                <Pressable hitSlop={HIT_SLOP_EXPAND_10} onPress={onPressPrivacy}>
                    <TextBase title={languages.premiumScreen.privacyAndTerms}
                        style={{ textDecorationLine: "underline" }} />
                </Pressable>
                <TextBase title={languages.premiumScreen.cancelAnytime} />

            </View>
        </View>
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background
        },
        flexRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: HS._16,
            paddingVertical: VS._10,
            gap: HS._10
        },
        imageHeader: {
            width: "100%",
            height: VS._100
        },
        gradientHeader: {
            ...StyleSheet.absoluteFillObject,
            zIndex: 10
        },
        content: {
            flex: 1,
            marginTop: -VS._28,
            width: "100%"
        },
        header: {
            position: "absolute",
            right: HS._16,
            zIndex: 100,
            padding: MHS._6,
            backgroundColor: theme.background,
            borderRadius: MHS._16,
        },
        packageItem: {
            borderRadius: MHS._16,
            width: Device.width - HS._32 * 2,
            marginTop: VS._10,
            paddingVertical: VS._10,
            paddingHorizontal: HS._16,
            flexDirection: "row",
            alignItems: "flex-end",
            gap: HS._4
        },
        packageSelected: {
            borderColor: theme.text
        },
        packageNotSelected: {
            borderColor: theme.btnInactive
        },
        buttonGet: {
            borderRadius: MHS._10,
            width: "90%",
            marginTop: VS._10,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: VS._10,
            backgroundColor: theme.text
        },
        footer: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: HS._16,
            justifyContent: "space-between",
        },
        contentView: {
            backgroundColor: `${theme.backgroundTextInput}20`,
            width: Device.width - HS._32 * 2,
            marginTop: VS._20,
            paddingHorizontal: HS._4,
            borderRadius: MHS._10
        },
        freeTrial: {
            textDecorationLine: "underline"
        },
        viewDes: {
            paddingHorizontal: HS._10,
        },
        policy: {
            textDecorationLine: "underline",
            textAlign: "center",
            marginTop: VS._10,
        },
    })
}

export default PremiumServiceScreen
