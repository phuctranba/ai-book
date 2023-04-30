import {RouteProp, useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {IconCopy, IconShare} from 'assets/svgIcons';
import TextBase from 'components/TextBase';
import {useAppDispatch, useAppSelector} from 'configs/store.config';
import {HIT_SLOP_EXPAND_10, STORE_LINK} from 'constants/system.constant';
import {insertBook} from 'helpers/sqlite.helper';
import {logEventAnalytics, showToast, useDisplayAds, useSystem} from 'helpers/system.helper';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {BackHandler, Pressable, ScrollView, Share, StyleSheet, View} from 'react-native';
import {Device} from 'ui/device.ui';
import {Shadow2} from "ui/shadow.ui";
import {FontSizes, HS, MHS, VS} from 'ui/sizes.ui';
import {RootColor, SystemTheme} from 'ui/theme';
import {v4 as uuidv4} from "uuid";
import {functionSendMessage} from './components/utils';
import {TypedBookSummary} from "models/book.modal";
import FastImage from "react-native-fast-image";
import TypingText from "screens/summary/typingText";
import {setFreeSummaryCount} from "store/reducer/system.reducer.store";
import InAppReview from "react-native-in-app-review";
import {GlobalPopupHelper} from "helpers/index";
import {EnumAnalyticEvent} from "constants/anlytics.constant";
import {languages} from "../../languages";
import Clipboard from "@react-native-community/clipboard";
import {setFalseModalRate} from "store/reducer/control.reducer.store";

const DEFAULT_IMAGE = require('assets/images/book-default.png')


const SummaryScreen = () => {
    const {styles, theme} = useSystem(createStyles);

    const dispatch = useAppDispatch();
    const typingComponentRef = useRef<any>(null)
    const textAnswer = useRef<string>("")
    const navigation: any = useNavigation();
    const {
        freeSummaryCount,
        genderVoice,
    } = useAppSelector(state => state.system)
    const showModalRate = useAppSelector(state => state.control.showModalRate)
    const refTypingText = useRef<any>();
    const {
        displayAlertAds,
        chatgpt_key,
        native_ads_pre
    } = useDisplayAds()
    const eventNameId = useRef(uuidv4())
    const route = useRoute<RouteProp<{ item: { book: TypedBookSummary, summary: boolean } }>>()
    const book: TypedBookSummary = route.params?.book || {}
    const summary: boolean = route.params?.summary || false
    const [canCopy, setCanCopy] = useState(summary);
    const [showFullText, setShowFullText] = useState<boolean>(false);
    const [needShowBtn] = useState<boolean>((book.volumeInfo?.description || "").length > 120);
    const speedSSEMessage = useAppSelector(state => state.system.speedSSEMessage)

    useEffect(
        () =>
            navigation.addListener('beforeRemove', (e) => {
                if (canCopy) {
                    // If we don't have unsaved changes, then we don't need to do anything
                    return;
                }

                e.preventDefault();

                GlobalPopupHelper.alertRef.current?.alert({
                    title: languages.settingScreen.leaveScreen,
                    message: languages.settingScreen.leaveScreenBook,
                    actions: [{
                        text: languages.settingScreen.leaveScreen,
                        onPress: () => navigation.dispatch(e.data.action)
                    }, {
                        text: languages.stay,
                    }]
                })
            }),
        [navigation, canCopy]
    );

    const renderHeaderTitle = useCallback(() => {
        return (
            <View style={[styles.headerLeft, {alignItems: "center"}]}>
                <TextBase
                    fontSize={FontSizes._16} fontWeight="bold"
                    title={(book.volumeInfo?.title || "").length > 25 ? book.volumeInfo?.title?.slice(0, 23) + ".." : book.volumeInfo?.title}/>
            </View>
        )
    }, [theme, freeSummaryCount])

    const onShare = useCallback(async () => {
        try {
            await Share.share({
                message:
                    "Download app from " + STORE_LINK
            });
        } catch (error) {

        }
    }, [])

    const renderHeaderRight = useCallback(() => {
        return (
            <Pressable hitSlop={HIT_SLOP_EXPAND_10} style={[styles.headerLeft]} onPress={onShare}>
                <IconShare size={MHS._20} color={theme.text}/>
            </Pressable>
        )
    }, [theme])

    useEffect(() => {
        navigation.setOptions({
            headerRight: renderHeaderRight,
            headerTitle: renderHeaderTitle,
        })
    }, [theme, freeSummaryCount])

    useEffect(() => {
        if (!summary) {
            dispatch(setFreeSummaryCount(-1))
            typingComponentRef.current?.setTyping(true)

            const messageSendToChatGPT = [{
                role: "user",
                content: "Tóm tắt cho tôi nội dung cuốn sách " + book.volumeInfo?.title + (book.volumeInfo?.authors?.[0]?" của tác giả " + book.volumeInfo?.authors?.[0]:"")
            }]

            functionSendMessage({
                chatgpt_key,
                messageSendToChatGPT,
                handleData,
                handleDataGPT,
                eventName: eventNameId.current
            })
        }
    }, [])

    const handleData = useCallback((text) => {
        try {
            const value = Device.isAndroid ? text.split("data:")?.[1]?.trim?.() : text
            const objectValue = JSON.parse(value)
            const word = objectValue?.choices?.[0]?.delta?.content || ""
            if (!!word || (word.trim() && !textAnswer.current)) {
                typingComponentRef.current?.setHasAnswer(true)
                textAnswer.current += word;
                typingComponentRef.current?.setText(textAnswer.current);
            }
            refTypingText.current?.setText(textAnswer.current);
        } catch (error) {

        }
    }, [genderVoice])

    const handleDataGPT = useCallback(async () => {
        typingComponentRef.current?.setDone()
        book.summaryContent = textAnswer.current;
        insertBook({...book, dateSummary: new Date().getTime()+"", summaryContent: book.summaryContent})
        setCanCopy(true);
    }, [genderVoice])

    const onSwitchFullDes = useCallback(() => {
        setShowFullText(old => !old);
    }, []);

    const onConfirmCopy = () => {
        try {
            Clipboard.setString(book.summaryContent);
            showToast(languages.homeScreen.copySuccess)
        } catch (error) {

        }
    }

    const onCoppy = () => {
        if (showModalRate) {
            onConfirmCopy();
            dispatch(setFalseModalRate())
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
            displayAlertAds({
                title: languages.homeScreen.copyChat,
                message: languages.homeScreen.copyChatDes,
                callback: onConfirmCopy
            })
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container} style={{flex: 1, backgroundColor: theme.background}}>
            <View style={{flexDirection: 'row'}}>
                <FastImage
                    source={book.volumeInfo?.imageLinks?.thumbnail ? {uri: book.volumeInfo?.imageLinks?.thumbnail} : DEFAULT_IMAGE}
                    style={{width: MHS._100, height: MHS._100, alignSelf: "center", marginRight: HS._6}}
                    resizeMode={"contain"}
                />
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <TextBase title={book.volumeInfo?.title} fontSize={FontSizes._20} color={theme.text}/>

                    {
                        book.volumeInfo?.authors?.[0] ?
                            <TextBase title={"Tác giả: " + book.volumeInfo?.authors?.[0]}
                                      style={{marginTop: MHS._6}}
                                      fontSize={FontSizes._14} color={theme.text} fontWeight={"bold"}
                                      numberOfLines={1}/>
                            :
                            null
                    }
                    {
                        book.volumeInfo?.publishedDate ?
                            <TextBase title={"Xuất bản: " + book.volumeInfo?.publishedDate}
                                      style={{marginTop: MHS._6}}
                                      fontSize={FontSizes._14} color={theme.text} fontWeight={"bold"}
                                      numberOfLines={1}/>
                            :
                            null
                    }

                </View>
            </View>
            {
                book.volumeInfo?.description ?
                    <View>
                        <TextBase title={"Mô tả"}
                                  style={{marginTop: MHS._16}}
                                  fontSize={FontSizes._18}
                                  color={theme.btnActive} fontWeight={"bold"}/>
                        <TextBase title={book.volumeInfo?.description}
                                  style={{marginTop: MHS._6, textAlign: 'justify'}}
                                  numberOfLines={(!showFullText && needShowBtn) ? 2 : undefined}
                                  fontSize={FontSizes._14} color={theme.text}/>
                        {
                            needShowBtn ?
                                <TextBase
                                    color={theme.btnActive}
                                    onPress={onSwitchFullDes}
                                    title={showFullText ? "Hide" : "Show more"}
                                    style={styles.txtMore}/>
                                :
                                null
                        }
                    </View>
                    :
                    null
            }

            <View style={{flexDirection:'row', marginTop: MHS._16}}>
                <TextBase title={languages.homeScreen.summary}
                          style={{marginBottom: MHS._6, textAlign: 'justify', marginRight:HS._16}}
                          fontSize={FontSizes._18}
                          color={theme.btnActive} fontWeight={"bold"}/>
                {canCopy && <Pressable onPress={onCoppy}>
                    <IconCopy size={MHS._18} color={theme.text}/>
                </Pressable>}
            </View>

            {
                summary ?
                    <TextBase title={book.summaryContent}
                              style={{textAlign: 'justify'}}/>
                    :
                    <TypingText ref={refTypingText} speed={speedSSEMessage}/>
            }

        </ScrollView>
    );
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            paddingTop: VS._12,
            paddingBottom: VS._24,
            paddingHorizontal: HS._12
        },
        headerLeft: {
            paddingHorizontal: HS._16
        },
        viewWave: {
            height: MHS._46,
            justifyContent: 'center',
            marginHorizontal: HS._20,
            marginTop: VS._6,
            paddingHorizontal: HS._20,
            borderRadius: MHS._50,
            alignItems: 'center',
            backgroundColor: "#EAEAEA",
            marginBottom: Device.paddingBottom
        },
        txtMore: {
            textDecorationLine: 'underline',
            alignSelf: 'flex-end'
        },
        avatar: {
            width: MHS._34,
            height: MHS._34,
            borderRadius: MHS._34,
        },
        itemQuestion: {
            backgroundColor: `${theme.btnInactive}40`,
            marginTop: VS._8,
            paddingVertical: VS._6,
            paddingHorizontal: HS._10,
            borderRadius: MHS._10
        },

        viewBottomBtn: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: HS._12
        },
        btnPremium: {
            flex: .38,
            marginVertical: VS._12,
            backgroundColor: RootColor.PremiumColor,
            paddingVertical: VS._14,
            borderRadius: MHS._40,
            alignItems: 'center'
        },
        btnFreeMessage: {
            flex: .58,
            flexDirection: 'row',
            marginVertical: VS._12,
            backgroundColor: theme.btnActive,
            paddingVertical: VS._14,
            borderRadius: MHS._40,
            alignItems: 'center',
            justifyContent: 'center'
        },
        btnRecord: {
            position: 'absolute',
            right: HS._18,
            bottom: VS._80,
            backgroundColor: "#EAEAEA",
            padding: MHS._10,
            borderRadius: MHS._8,
            ...Shadow2
        },
        btnSpeakerEnable: {
            position: 'absolute',
            top: MHS._4,
            right: MHS._4,
            backgroundColor: RootColor.PremiumColor,
            padding: MHS._6,
            borderRadius: MHS._4
        },
        btnSpeakerDisable: {
            position: 'absolute',
            top: MHS._4,
            right: MHS._4,
            backgroundColor: RootColor.PremiumColor,
            padding: MHS._6,
            borderRadius: MHS._4,
            opacity: 0.5
        },
        txtFreeMessage: {
            fontWeight: 'bold',
            fontSize: FontSizes._12,
            color: theme.text
        }
    })
}

export default SummaryScreen;
