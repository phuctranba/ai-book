import Clipboard from '@react-native-community/clipboard';
import {IconCopy} from 'assets/svgIcons';
import TextBase from 'components/TextBase';
import {useAppDispatch, useAppSelector} from "configs/store.config";
import {EnumAnalyticEvent} from 'constants/anlytics.constant';
import {CHATGPT_ID} from 'constants/system.constant';
import {GlobalPopupHelper} from "helpers/index";
import {logEventAnalytics, openURLWebView, showToast, useDisplayAds, useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import {EnumTypeMessage, TypedChatHistory} from 'models/chat.model';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import isEqual from 'react-fast-compare';
import {Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import NativeAdView, {
    AdBadge,
    CallToActionView,
    HeadlineView,
    IconView,
    NativeMediaView,
    TaglineView
} from "react-native-admob-native-ads";
import Hyperlink from 'react-native-hyperlink';
import InAppReview from 'react-native-in-app-review';
import {setFreeGiftCount, setFreeMessagePremium, switchAdsId} from "store/reducer/system.reducer.store";
import {Device} from "ui/device.ui";
import {FontSizes, FontWeights, HS, MHS, VS} from "ui/sizes.ui";
import {RootColor, SystemTheme} from "ui/theme";

export let LIST_ID_MESSAGE_ADS: string[] = []

type TypedMessageBubbleProps = {
    chatHistory: TypedChatHistory;
    isGroup?: boolean;
    showModalRate?: boolean;
    setShowModalRate?: (value: boolean) => void
    setHideAdsMessage: () => void
    setShowAdsMessage: () => void
    refTextFreeMessage: any
};


const MessageBubble = ({
                           chatHistory,
                           showModalRate,
                           setShowModalRate,
                           setHideAdsMessage,
                           setShowAdsMessage,
                           refTextFreeMessage
                       }: TypedMessageBubbleProps) => {
    const {styles, theme} = useSystem(createStyles);
    const dispatch = useAppDispatch();
    const isPremium = useAppSelector(state => state.system.isPremium);
    const freeGiftCount = useAppSelector(state => state.system.freeGiftCount);
    const {
        displayAlertAds,
        count_down_ads_message,
        rate_show_full_native_ads,
        max_gift_message,
        nativeAdsId,
        native_ads_chat
    } = useDisplayAds()
    const [loadAdsDone, setLoadAdsDone] = useState<boolean>(false)
    const [showAds, setShowAds] = useState<boolean>(!isPremium)
    const [showHideButton, setShowHideButton] = useState<boolean>(false)
    const nativeAdViewRef = useRef<any>();
    const refCountDown = useRef<any>();
    const refIsGotGift = useRef<any>(false);
    const isOldMessage = LIST_ID_MESSAGE_ADS.includes(chatHistory?._id || "")
    const refUseFullNativeAds = useRef(Math.random() < Number(rate_show_full_native_ads))
    const intervalCountdown = useRef<any>()
    const refCountDownNow = useRef<number>(1);
    const refShouldReLoadAds = useRef<boolean>(true)

    useEffect(() => {
        if ((!isOldMessage) && nativeAdViewRef.current && native_ads_chat && nativeAdsId && chatHistory.message_type === EnumTypeMessage.Ads && refShouldReLoadAds.current) {
            refShouldReLoadAds.current = false;
            nativeAdViewRef.current?.loadAd()
        }
    }, [nativeAdsId, native_ads_chat])

    const isMyMessage = (chatHistory?.createBy?.user_id != CHATGPT_ID) && (chatHistory?.createBy?._id != CHATGPT_ID)

    const onLongPressMessage = () => {
        if (showModalRate) {
            onConfirmCopy();
            setShowModalRate?.(false);
            setTimeout(() => {
                if (InAppReview.isAvailable()) {
                    GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
                    InAppReview.RequestInAppReview()
                        .then((hasFlowFinishedSuccessfully) => {
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            }, 1000)
        } else {
            logEventAnalytics(EnumAnalyticEvent.CopyChat)
            if (isPremium) {
                onConfirmCopy()
                return
            }
            displayAlertAds({
                title: languages.homeScreen.copyChat,
                message: languages.homeScreen.copyChatDes,
                callback: onConfirmCopy
            })
        }

    }

    const onConfirmCopy = () => {
        try {
            Clipboard.setString(chatHistory.chat_content || "");
            showToast(languages.homeScreen.copySuccess)
        } catch (error) {

        }
    }

    const getFreeMessage = useCallback(() => {
        clearInterval(intervalCountdown?.current)
        if (!refIsGotGift.current) {
            dispatch(setFreeGiftCount(-1))
            refIsGotGift.current = true;
            let freeMessage = Math.floor(Math.random() * Number(max_gift_message)) + 1;
            dispatch(setFreeSummaryCount(freeMessage))
            refTextFreeMessage.current?.tada(2000)
            showToast(languages.homeScreen.gotMessage.replace(":freeMessage", freeMessage + ""))
            setTimeout(() => {
                setHideAdsMessage()
                setLoadAdsDone(false)
                setShowAds(false)
                LIST_ID_MESSAGE_ADS.push(chatHistory?._id || "")
            }, 1000)
        }
    }, [refTextFreeMessage])

    const onHide = useCallback(() => {
        dispatch(setFreeSummaryCount(0))
        setTimeout(() => {
            setHideAdsMessage()
            setLoadAdsDone(false)
            setShowAds(false)
            LIST_ID_MESSAGE_ADS.push(chatHistory?._id || "")
        }, 1000)
    }, [])

    //////////////

    const onAdFailedToLoad = useCallback((error) => {
        if (!(error.code == 0 && error.currencyCode == "USD")) {
            logEventAnalytics(EnumAnalyticEvent.NativeAdsFailedToLoad + "message")
            console.log(EnumAnalyticEvent.NativeAdsFailedToLoad + "message")
            console.log("Call switchAdsId message")
            dispatch(switchAdsId("native"))
            refShouldReLoadAds.current = true;
        }
    }, [])

    const onNativeAdLoaded = useCallback((data) => {
        if (freeGiftCount > 0) {
            refUseFullNativeAds.current = false;
        }

        if (data?.store) {
            refUseFullNativeAds.current = true;
        }

        setShowAdsMessage()
        setLoadAdsDone(true)
        let secondToCountDown = Number(count_down_ads_message);
        intervalCountdown.current = setInterval(() => {
            if (secondToCountDown <= 0) {
                clearInterval(intervalCountdown?.current)
                setTimeout(() => {
                    setShowHideButton(true);
                })
            } else {
                secondToCountDown--;
                refCountDownNow.current = secondToCountDown;
                refCountDown.current?.setNativeProps({text: languages.homeScreen.countDown.replace(":secondToCountDown", secondToCountDown + "")})
            }
        }, 1000)

        logEventAnalytics(EnumAnalyticEvent.onNativeAdsLoaded + "message")
        console.log(EnumAnalyticEvent.onNativeAdsLoaded + "message")
    }, [freeGiftCount])

    const onAdClicked = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClicked + "message")
        console.log(EnumAnalyticEvent.NativeAdsClicked + "message")
    }, [])

    const onAdImpression = useCallback(() => {
        if (refCountDownNow.current <= 0) {
            setHideAdsMessage()
            setLoadAdsDone(false)
            setShowAds(false)
            LIST_ID_MESSAGE_ADS.push(chatHistory?._id || "")
        }
        logEventAnalytics(EnumAnalyticEvent.NativeAdsImpression + "message")
        console.log(EnumAnalyticEvent.NativeAdsImpression + "message")
    }, [])

    const onAdOpened = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsOpened + "message")
        console.log(EnumAnalyticEvent.NativeAdsOpened + "message")
    }, [])

    const onAdLeftApplication = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLeftApplication + "message")
        console.log(EnumAnalyticEvent.NativeAdsLeftApplication + "message")
    }, [])

    const onAdClosed = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsClosed + "message")
        console.log(EnumAnalyticEvent.NativeAdsClosed + "message")
    }, [])

    const onAdLoaded = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.NativeAdsLoaded + "message")
        console.log(EnumAnalyticEvent.NativeAdsLoaded + "message")
    }, [])

    //////////////

    if (isOldMessage || (chatHistory.message_type === EnumTypeMessage.Ads && !native_ads_chat) || ((chatHistory.chat_content == null || chatHistory.chat_content?.trim() == "") && chatHistory.message_type !== EnumTypeMessage.Ads)) {
        return null
    }

    return (
        <View style={styles.baseline} key={`${chatHistory._id}`}>
            {/*Show text*/}
            <View style={[styles.viewRowBubble, {justifyContent: isMyMessage ? "flex-end" : 'flex-start'}]}>
                {
                    chatHistory.message_type === EnumTypeMessage.Ads ?
                        <View style={loadAdsDone ? styles.messageAdsShow : styles.messageAdsHide}>
                            {!showHideButton && <TextInput
                                ref={refCountDown}
                                value={languages.homeScreen.countDown.replace(":secondToCountDown", count_down_ads_message + "")}
                                style={[styles.countDown]}/>}
                            {showAds && <NativeAdView
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
                                <View style={{flexGrow: 1, flexShrink: 1, paddingHorizontal: HS._16,}}>
                                    <AdBadge textStyle={{color: theme.text}} style={{borderColor: theme.text}}/>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: HS._8,
                                        marginBottom: MHS._6
                                    }}>
                                        <IconView style={{width: 40, height: 40}}/>
                                        <View style={{flex: 1}}>
                                            <HeadlineView
                                                style={{fontWeight: 'bold', fontSize: 13, color: theme.text}}/>
                                            <TaglineView numberOfLines={2}
                                                         style={{fontSize: 11, color: theme.text}}/>
                                        </View>
                                    </View>
                                </View>
                                <NativeMediaView style={{width: Device.width - HS._48, height: VS._120}}/>

                                {refUseFullNativeAds.current && <CallToActionView
                                    style={{...styles.buttonAds, backgroundColor: theme.btnActive}}
                                    textStyle={{
                                        color: theme.textLight,
                                        fontSize: FontSizes._16,
                                        ...FontWeights.Bold_600_SVN
                                    }}
                                    buttonAndroidStyle={{...styles.buttonAds, backgroundColor: theme.btnActive}}
                                    allowFontScaling={false}
                                    allCaps
                                />}
                            </NativeAdView>}
                            {(!refUseFullNativeAds.current && !showHideButton) &&
                                <TouchableOpacity style={{...styles.buttonAds, backgroundColor: theme.btnActive}}
                                                  onPress={getFreeMessage}>
                                    <TextBase color={theme.textLight} fontSize={16}
                                              fontWeight='600'>{languages.homeScreen.getFreeMessage}</TextBase>
                                </TouchableOpacity>
                            }
                            {
                                showHideButton &&
                                <TouchableOpacity style={styles.buttonHideAds}
                                                  onPress={onHide}>
                                    <TextBase color={theme.textLight} fontSize={16} fontWeight='600'
                                              style={{textDecorationLine: 'underline'}}
                                    > {languages.homeScreen.hide}</TextBase>
                                </TouchableOpacity>
                            }
                        </View>
                        :
                        ((chatHistory.chat_content && chatHistory.chat_content !== "") ?
                            <View
                                style={[styles.messageBubble, isMyMessage ? {
                                    ...styles.myMessageBubble,
                                    backgroundColor: theme.backgroundMain
                                } : {backgroundColor: `${theme.btnInactive}40`}]}
                            >
                                <Hyperlink onPress={async (url, text) => {
                                    await openURLWebView(url)
                                }}>
                                    <TextBase color={isMyMessage ? theme.textLight : theme.text}>
                                        {chatHistory.chat_content.trim()}
                                    </TextBase>
                                </Hyperlink>

                                {
                                    !isMyMessage && isPremium ?
                                        <View style={{
                                            marginTop: VS._2,
                                            paddingHorizontal: HS._6,
                                            paddingVertical: VS._2,
                                            borderRadius: MHS._30,
                                            backgroundColor: "#FFFFFF",
                                            alignSelf: 'flex-end'
                                        }}>
                                            <TextBase
                                                fontSize={FontSizes._9}
                                                color={RootColor.PremiumColor} fontWeight={"bold"}
                                                title={"Premium - V4 ⚡️"}/>
                                        </View>

                                        :
                                        null
                                }
                            </View>
                            : null)
                }
                {
                    (!isMyMessage && chatHistory.message_type != EnumTypeMessage.Ads) ? (
                        <Pressable onPress={onLongPressMessage} style={{marginBottom: VS._10}}>
                            <IconCopy size={MHS._18} color={theme.text}/>
                        </Pressable>
                    ) : null
                }

            </View>
        </View>
    );
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        messageBubble: {
            borderTopLeftRadius: FontSizes._16,
            borderTopRightRadius: FontSizes._16,
            borderBottomRightRadius: FontSizes._16,
            maxWidth: '75%',
            alignItems: 'flex-start',
            marginVertical: VS._5,
            paddingTop: VS._10,
            paddingBottom: VS._6,
            paddingHorizontal: HS._10,
            overflowL: "hidden"
        },
        messageAdsShow: {
            borderRadius: FontSizes._16,
            width: Device.width - HS._32,
            alignItems: 'flex-start',
            marginVertical: VS._5,
            paddingVertical: VS._10,
            paddingHorizontal: HS._10,
            overflowL: "hidden",
            backgroundColor: `${theme.btnInactive}40`
        },
        messageAdsHide: {
            width: 0,
            height: 0,
            overflowL: "hidden"
        },
        myMessageBubble: {
            alignSelf: "flex-end",
            borderBottomRightRadius: 0,
            borderBottomLeftRadius: FontSizes._16,
            maxWidth: '80%',
            alignItems: 'flex-end',
            marginLeft: 0,
        },
        avatar: {
            width: MHS._34,
            height: MHS._34,
            borderRadius: MHS._34,
        },
        viewRowBubble: {
            flexDirection: 'row',
            width: '100%',
            alignItems: 'flex-end',
            gap: HS._10
        },
        timeMessage: {
            textAlign: "center",
            marginTop: VS._16,
            alignSelf: "center",
            marginVertical: VS._4
        },
        countDown: {
            padding: 0,
            color: theme.text,
            fontSize: FontSizes._14,
            alignSelf: 'flex-end'
        },
        nativeAdsContainer: {
            width: "100%",
        },
        titleSystem: {
            textAlign: "center",
            alignSelf: "center",
            marginHorizontal: HS._32,
            marginBottom: VS._16,
            opacity: 0.6
        },
        buttonAds: {
            width: "100%",
            marginTop: VS._10,
            height: MHS._46,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: MHS._8
        },
        buttonHideAds: {
            width: "100%",
            marginTop: VS._10,
            height: MHS._40,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: MHS._8
        },
        baseline: {
            alignItems: "baseline",
            paddingHorizontal: HS._16,
            transform: [{
                rotate: Platform.OS == "android" ? "180deg" : "0deg"
            }]
        },
        marginRight: {
            marginRight: HS._10
        },
        timeAni: {
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center"
        }
    })
}

export default memo(MessageBubble, isEqual);
