import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {IconCopy, IconShare, IconSpeaker, IconSpeakerMute} from 'assets/svgIcons';
import TextBase from 'components/TextBase';
import {useAppDispatch, useAppSelector} from 'configs/store.config';
import {HIT_SLOP_EXPAND_10, STORE_LINK} from 'constants/system.constant';
import {insertBook} from 'helpers/sqlite.helper';
import {logEventAnalytics, showToast, useDisplayAds, useSystem} from 'helpers/system.helper';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    DeviceEventEmitter,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
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
import {NAVIGATION_PREMIUM_SERVICE_SCREEN} from "constants/router.constant";
import navigationHelper from "helpers/navigation.helper";
import {textToSpeech} from "../../services/textToSpeech.service";
import {sort} from "helpers/object.helper";
import Sound from "react-native-sound";
import isEqual from "react-fast-compare";
import LinearGradient from 'react-native-linear-gradient';

const DEFAULT_IMAGE = require('assets/images/book-default.png')


const SummaryScreen = () => {
    const {styles, theme} = useSystem(createStyles);

    const dispatch = useAppDispatch();
    const refTypingText = useRef<any>()
    const textAnswer = useRef<string>("")
    const navigation: any = useNavigation();
    const freeSummaryCount = useAppSelector(state => state.system.freeSummaryCount)
    const showModalRate = useAppSelector(state => state.control.showModalRate)
    const {
        displayAlertAds,
        chatgpt_key,
        key_google_cloud
    } = useDisplayAds()
    const eventNameId = useRef(uuidv4())
    const route = useRoute<RouteProp<{ item: { book: TypedBookSummary, summary: boolean } }>>()
    const book: TypedBookSummary = route.params?.book || {}
    const summary: boolean = route.params?.summary || false
    const [canCopy, setCanCopy] = useState(summary);
    const [showFullText, setShowFullText] = useState<boolean>(false);
    const [needShowBtn] = useState<boolean>((book.volumeInfo?.description || "").length > 120);
    const speedSSEMessage = useAppSelector(state => state.system.speedSSEMessage)
    const useNormalSummary = useAppSelector(state => state.system.useNormalSummary)
    const [isUseNormalSummary, setIsUseNormalSummary] = useState<boolean>(summary ? book.isNormalSummary : useNormalSummary)
    const isPremium = useAppSelector(state => state.system.isPremium)
    const refIsPremium = useRef(isPremium)
    const refIsUseNormalSummary = useRef(isUseNormalSummary)
    const refTextSentenceList = useRef<string[]>([])
    const refTextSentenceListToStorage = useRef<string[]>([])
    const textSentence = useRef<string>("")
    const refVoiceReading = useRef<{ name: string, path: string }[]>([]);
    const refIsReading = useRef<boolean>(false);
    const refCurrentSound = useRef<Sound | undefined>();
    const [isSpeeching, setIsSpeeching] = useState(false)
    const [isLoadingSpeech, setIsLoadingSpeech] = useState(false)
    const [showSpeechButton, setShowSpeechButton] = useState(false)
    const [showSwitchButton, setShowSwitchButton] = useState(summary)
    const refShowSpeechButton = useRef<any>(showSpeechButton)
    const refAllowSpeech = useRef<boolean>(false)
    const refTimeOutSwitch = useRef<any>()

    useEffect(() => {
        refShowSpeechButton.current = showSpeechButton
    }, [showSpeechButton])

    useEffect(() => {
        refIsPremium.current = isPremium
    }, [isPremium])

    useEffect(() => {
        refIsUseNormalSummary.current = isUseNormalSummary
    }, [isUseNormalSummary])

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
                        onPress: () => {
                            navigation.dispatch(e.data.action)
                        }
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
        logEventAnalytics(EnumAnalyticEvent.PressShare)
        GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd()
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

    const generateSummary = useCallback((isUseNormal: boolean) => {
        let prompt;
        if (isUseNormal) {
            prompt = languages.homeScreen.promptSummarySort.replace(":book", book.volumeInfo?.title || "") + (book.volumeInfo?.authors?.[0] ? languages.homeScreen.promptSummaryAuthor.replace(":author", book.volumeInfo?.authors?.[0]) : "")
        } else {
            prompt = languages.homeScreen.promptSummaryDetail.replace(":book", book.volumeInfo?.title || "") + (book.volumeInfo?.authors?.[0] ? languages.homeScreen.promptSummaryAuthor.replace(":author", book.volumeInfo?.authors?.[0]) : "") + languages.homeScreen.promptSummaryDetailTail
        }
        console.log(prompt, "-----------")
        const messageSendToChatGPT = [{
            role: "user",
            content: prompt
        }]

        functionSendMessage({
            chatgpt_key,
            messageSendToChatGPT,
            handleData,
            handleDataGPT,
            eventName: eventNameId.current
        })
    }, [])

    useEffect(() => {
        if (!summary) {
            if (!refIsPremium.current) {
                dispatch(setFreeSummaryCount(-1))
            }

            refTimeOutSwitch.current = setTimeout(() => {
                setShowSwitchButton(true)
            }, 5000)
            generateSummary(isUseNormalSummary)
        } else {
            refTypingText.current?.setFullText(book?.summaryContent);
            [...book.summaryContent].forEach(word => {
                textSentence.current += word;
                if (([". ", "! ", "? "].includes(textSentence.current.slice(-2)) || textSentence.current.endsWith("\n")) && textSentence.current.length >= 100) {
                    if (refTextSentenceList.current.length === 0) {
                        setShowSpeechButton(true);
                    }
                    refTextSentenceList.current?.push(textSentence.current)
                    refTextSentenceListToStorage.current?.push(textSentence.current)
                    textSentence.current = "";
                }
            })
            if (textSentence.current.length > 0) {
                refTextSentenceList.current?.push(textSentence.current)
                refTextSentenceListToStorage.current?.push(textSentence.current)
                textSentence.current = "";
            }
        }

        return (() => {
            DeviceEventEmitter.removeAllListeners(eventNameId.current);
            if (refTimeOutSwitch.current) {
                clearTimeout(refTimeOutSwitch.current)
            }
            stopSpeech()
        })
    }, [])

    const checkToPlayContinueVoice = useCallback(() => {
        if (refAllowSpeech.current) {
            if (refVoiceReading.current.length > 0) {
                playContinueVoice()
            }
        }
    }, [])

    const playContinueVoice = useCallback(() => {
        if (refAllowSpeech.current) {
            refIsReading.current = true;
            let pathFile: string = refVoiceReading.current?.[0]?.path;
            refVoiceReading.current.shift();
            refCurrentSound.current = new Sound(pathFile, "", (error) => {
                if (error) {
                    console.log("fail to load sound");
                    return;
                }
                refCurrentSound.current?.play(() => {
                    refIsReading.current = false;
                    if (refVoiceReading.current.length === 0) {
                        setIsSpeeching(false);
                    }
                    checkToPlayContinueVoice();
                })
            });
        }

    }, [])

    const startTextToSpeech = useCallback(async () => {
        if (refAllowSpeech.current) {
            if (refVoiceReading.current.length === 0 && !refIsReading.current) {
                setIsLoadingSpeech(true);
            }

            if (refTextSentenceList.current?.length > 0 && refVoiceReading.current.length <= 5) {
                let text = refTextSentenceList.current.shift()
                textToSpeech({
                    text: text || "",
                    tokenGoogle: key_google_cloud,
                    language: languages.getInterfaceLanguage(),
                })
                    .then((result) => {
                        if (refAllowSpeech.current) {
                            if (result.name) {
                                refVoiceReading.current = [...refVoiceReading.current, result];
                                refVoiceReading.current.sort(sort("name"))
                                if (refVoiceReading.current.length > 0 && !refIsReading.current) {
                                    setIsSpeeching(true);
                                    setIsLoadingSpeech(false);
                                    playContinueVoice()
                                }
                                startTextToSpeech()
                            } else {
                                setIsLoadingSpeech(false);
                            }
                        }

                    }).catch((error) => {
                    console.log("error", error);

                    setIsLoadingSpeech(false);
                    setIsSpeeching(false);
                })
            }
        }
    }, [])

    const handleData = useCallback((text) => {
        try {
            const value = Device.isAndroid ? text.split("data:")?.[1]?.trim?.() : text
            const objectValue = JSON.parse(value)
            const word = objectValue?.choices?.[0]?.delta?.content || ""
            if (!!word || (word.trim() && !textAnswer.current)) {
                textAnswer.current += word;
                refTypingText.current?.setText(textAnswer.current);

                if (refIsPremium.current) {
                    textSentence.current += word;
                    if (([". ", "! ", "? "].includes(textSentence.current.slice(-2)) || textSentence.current.endsWith("\n")) && textSentence.current.length >= 100) {
                        if (!refShowSpeechButton.current) {
                            setShowSpeechButton(true);
                        }
                        refTextSentenceList.current?.push(textSentence.current)
                        refTextSentenceListToStorage.current?.push(textSentence.current)
                        textSentence.current = "";
                    }
                }
            }
        } catch (error) {

        }
    }, [])

    const handleDataGPT = useCallback(async () => {
        if (textSentence.current.length > 0) {
            refTextSentenceList.current?.push(textSentence.current)
            refTextSentenceListToStorage.current?.push(textSentence.current)
            textSentence.current = "";
        }
        if (!refShowSpeechButton.current) {
            setShowSpeechButton(true);
        }

        refTypingText.current?.setDone()
        book.summaryContent = textAnswer.current;
        insertBook({
            ...book,
            dateSummary: new Date().getTime() + "",
            summaryContent: book.summaryContent,
            isNormalSummary: refIsUseNormalSummary.current
        })
        setCanCopy(true);
    }, [])

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

    const onCopy = () => {
        logEventAnalytics(EnumAnalyticEvent.PressCopy)
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
            if (refIsPremium.current) {
                onConfirmCopy();
                return;
            }

            logEventAnalytics(EnumAnalyticEvent.CopyChat)
            displayAlertAds({
                title: languages.homeScreen.copyChat,
                message: languages.homeScreen.copyChatDes,
                callback: onConfirmCopy
            })
        }
    }

    const onReading = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.PressReading)
        if (refIsPremium.current) {
            refAllowSpeech.current = true;
            if (!isEqual(refTextSentenceList.current?.[0], refTextSentenceListToStorage.current?.[0])) {
                refTextSentenceList.current = [...refTextSentenceListToStorage.current]
            }
            startTextToSpeech();
            return;
        }

        navigationHelper.replace(NAVIGATION_PREMIUM_SERVICE_SCREEN)
    }, [])

    const stopSpeech = useCallback(() => {
        refAllowSpeech.current = false;
        refAllowSpeech.current = false;
        refTextSentenceList.current = [];
        refIsReading.current = false;
        refCurrentSound.current?.release();
        refVoiceReading.current = [];
        setIsSpeeching(false);
        setIsLoadingSpeech(false)
    }, [])

    const switchSummary = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.PressSwitchSummary)
        if (isUseNormalSummary && !isPremium) {
            navigationHelper.replace(NAVIGATION_PREMIUM_SERVICE_SCREEN)
            return;
        }
        setShowSwitchButton(false)

        DeviceEventEmitter.removeAllListeners(eventNameId.current);
        stopSpeech();
        setShowSpeechButton(false);
        refTextSentenceList.current = [];
        refTextSentenceListToStorage.current = [];
        textSentence.current = ""
        setCanCopy(false)
        refTypingText.current?.resetText()
        eventNameId.current = uuidv4();
        generateSummary(!isUseNormalSummary)
        setIsUseNormalSummary(!isUseNormalSummary)

        refTimeOutSwitch.current = setTimeout(() => {
            setShowSwitchButton(true)
        }, 5000)
    }, [isUseNormalSummary, isPremium])


    return (
        <View style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container} style={{flex: 1, backgroundColor: theme.background}}>
                <View style={{flexDirection: 'row'}}>
                    <FastImage
                        source={book.volumeInfo?.imageLinks?.thumbnail ? {uri: book.volumeInfo?.imageLinks?.thumbnail} : DEFAULT_IMAGE}
                        style={{width: MHS._100, height: MHS._100, alignSelf: "center", marginRight: HS._6}}
                        resizeMode={"contain"}
                    />
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <TextBase title={book.volumeInfo?.title} fontSize={FontSizes._18} color={theme.text}/>

                        <TextBase
                            title={book.volumeInfo?.authors?.[0] ? "Author: " + book.volumeInfo?.authors?.[0] : "Unknow"}
                            style={{marginTop: MHS._6}}
                            fontSize={FontSizes._14} color={theme.text} fontWeight={"bold"}
                            numberOfLines={1}/>


                        <TextBase
                            title={book.volumeInfo?.publishedDate ? "Publish: " + book.volumeInfo?.publishedDate : "Unknow"}
                            style={{marginTop: MHS._6}}
                            fontSize={FontSizes._14} color={theme.text} fontWeight={"bold"}
                            numberOfLines={1}/>

                        {canCopy && <View style={styles.viewSaved}>
                            <TextBase title={"Saved"} color={RootColor.MainColor}
                                      fontSize={FontSizes._12} fontWeight={'bold'}/>
                        </View>}
                    </View>
                </View>

                {
                    book.volumeInfo?.description ?
                        <View>
                            <TextBase title={"Description"}
                                      style={{marginTop: VS._20}}
                                      fontSize={FontSizes._16}
                                      color={theme.btnActive} fontWeight={"bold"}/>
                            <TextBase title={book.volumeInfo?.description}
                                      style={styles.txtDes}
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

                <View style={{
                    flexDirection: 'row',
                    marginTop: VS._24,
                    alignSelf: 'center',
                    alignItems: 'center',
                    marginBottom: MHS._6
                }}>
                    <TextBase title={"Summary"}
                              style={{textAlign: 'justify', marginRight: HS._8, flex: 1}}
                              fontSize={FontSizes._16}
                              color={theme.btnActive} fontWeight={"bold"}/>

                    {
                        showSpeechButton ?
                            (isLoadingSpeech ?
                                <ActivityIndicator size={'small'} color={RootColor.PremiumColor}
                                                   style={{paddingHorizontal: HS._12}}/>
                                :
                                (
                                    isSpeeching ?
                                        <Pressable onPress={stopSpeech} style={{paddingHorizontal: HS._12}}>
                                            <IconSpeakerMute size={MHS._18} color={RootColor.PremiumColor}/>
                                        </Pressable>
                                        :
                                        <Pressable onPress={onReading} style={{paddingHorizontal: HS._12}}>
                                            <IconSpeaker size={MHS._18} color={RootColor.PremiumColor}/>
                                        </Pressable>
                                ))
                            :
                            null
                    }

                    {canCopy && <Pressable onPress={onCopy} style={{paddingHorizontal: HS._12}}>
                        <IconCopy size={MHS._18} color={theme.text}/>
                    </Pressable>}
                </View>

                <TypingText ref={refTypingText} speed={speedSSEMessage}/>
            </ScrollView>


            {showSwitchButton &&
                <LinearGradient locations={[0,0.3]} colors={['#00000000', theme.background]} style={styles.linearGradient}>
                    <TouchableOpacity
                        onPress={switchSummary}
                        activeOpacity={0.5}
                        style={[styles.btnSwitch, {backgroundColor: isUseNormalSummary ? RootColor.PremiumColor : theme.btnActive}]}>
                        <TextBase
                            title={isUseNormalSummary ? "Use detailed summary" : "Use short summary"}
                            color={theme.textLight}
                            fontSize={FontSizes._16} fontWeight={'bold'}/>
                    </TouchableOpacity>
                </LinearGradient>

            }
        </View>
    );
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            paddingTop: VS._12,
            paddingBottom: VS._100,
            paddingHorizontal: HS._12,
        },
        txtDes: {
            marginTop: MHS._6,
            textAlign: 'justify',
            lineHeight: FontSizes._20
        },
        headerLeft: {
            paddingHorizontal: HS._16
        },
        viewSaved: {
            borderColor: RootColor.MainColor,
            marginTop: VS._4,
            borderRadius: MHS._4,
            paddingHorizontal: MHS._4,
            borderWidth: MHS._1,
            paddingVertical: VS._2,
            alignSelf: 'flex-start'
        },
        linearGradient:{
            width:'100%',
            position: 'absolute',
            paddingVertical:VS._20,
            bottom: 0,
        },
        btnSwitch: {
            borderRadius: MHS._8,
            paddingHorizontal: HS._24,
            paddingVertical: VS._12,
            alignSelf: 'center',
            ...Shadow2
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
