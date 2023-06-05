import {IconLock, IconMic, IconSend} from 'assets/svgIcons';
import {HIT_SLOP_EXPAND_10} from 'constants/system.constant';
import {useSystem} from 'helpers/system.helper';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Keyboard, Pressable, PressableProps, StyleSheet, TextInput, View} from 'react-native';
import {Device} from 'ui/device.ui';
import {FontSizes, FontWeights, HS, MHS, VS} from 'ui/sizes.ui';
import {RootColor, SystemTheme} from 'ui/theme';
import {languages} from "../../languages";
import LottieView from "lottie-react-native";
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from "react-native-reanimated";
import {useAppSelector} from "configs/store.config";
import navigationHelper from "helpers/navigation.helper";
import {NAVIGATION_PREMIUM_SERVICE_SCREEN} from "constants/router.constant";

const AniPressable = Animated.createAnimatedComponent<PressableProps>(Pressable);
const WAVE = require("assets/lotties/wave.json")
const WAVE_SPEECH = require("assets/lotties/wave_speech.json")
const LOADING_WAVE = require("assets/lotties/loading_voice.json")

const pathColorWaveSpeech = [
    {
        keypath: "形状图层 36",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 35",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 34",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 33",
        color: "#FFFFFF"
    }, {
        keypath: "形状图层 32",
        color: "#FFFFFF"
    }, {
        keypath: "形状图层 31",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 30",
        color: "#FFFFFF"
    }, {
        keypath: "形状图层 29",
        color: "#FFFFFF"
    }, {
        keypath: "形状图层 28",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 27",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 26",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 25",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 24",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 23",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 22",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 21",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 20",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 19",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 18",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 17",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 16",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 15",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 14",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 13",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 12",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 11",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 10",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 9",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 8",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 7",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 6",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 5",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 4",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 3",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 2",
        color: "#FFFFFF"
    },
    {
        keypath: "形状图层 1",
        color: "#FFFFFF"
    },
]

const KeyboardInput = ({
                           onUserSendText,
                           onPressRecord,
                           onStopSpeeching,
                       }, ref) => {
    const {styles, theme} = useSystem(createStyles);
    const refInput = useRef<TextInput>(null);
    const valueInputRef = useRef("")
    const [isLoadingVoice, setIsLoadingVoice] = useState<boolean>(false)
    const [isLoadingSpeech, setIsLoadingSpeech] = useState<boolean>(false)
    const [isRecording, setIsRecording] = useState(false)
    const [isSpeeching, setIsSpeeching] = useState(false)
    const isPremium = useAppSelector(state => state.system.isPremium)
    const freeVoice = useAppSelector(state => state.system.freeVoice)
    const animationTyping = useSharedValue(0)
    const animationRecord = useSharedValue(0)
    const animationBackgroundColor = useSharedValue(0)

    useImperativeHandle(ref, () => ({
        setIsLoadingVoice,
        setIsLoadingSpeech,
        setIsRecording,
        setIsSpeeching,
    }))

    const onChangeText = useCallback((text: string) => {
        if (text.length > 0 && animationTyping.value === 0) {
            animationTyping.value = withTiming(1, {duration: 300})
        } else {
            if (text.length <= 0 && animationTyping.value === 1) {
                animationTyping.value = withTiming(0, {duration: 300})
            }
        }
        valueInputRef.current = text
    }, [])

    useEffect(() => {
        if (isRecording || isLoadingSpeech) {
            animationBackgroundColor.value = withTiming(isRecording ? 0 : 1, {duration: 300})
            animationRecord.value = withTiming(1, {duration: 300})
        }
    }, [isRecording, isLoadingSpeech])

    useEffect(() => {
        if (!isLoadingVoice && !isLoadingSpeech && !isRecording && !isSpeeching) {
            animationBackgroundColor.value = withTiming(0, {duration: 300})
            animationRecord.value = withTiming(0, {duration: 300})
        }
    }, [isLoadingVoice, isLoadingSpeech, isRecording, isSpeeching])

    useEffect(() => {
        if (isLoadingSpeech) {
            animationBackgroundColor.value = withTiming(1, {duration: 300})
            animationBackgroundColor.value = withTiming(1, {duration: 300})
        }
    }, [isLoadingSpeech])

    const onSendText = () => {
        animationTyping.value = withTiming(0, {duration: 300})
        /**
         * Xóa dấu cách và xuống dòng
         */
        if (valueInputRef.current.trim() !== "") {
            onUserSendText(valueInputRef.current.trim());
            valueInputRef.current = ""
            refInput.current?.setNativeProps({
                text: ""
            })
        }
    }

    const waveViewAniStyle = useAnimatedStyle(() => {
        return ({
            backgroundColor: interpolateColor(animationBackgroundColor.value, [0, 1], [RootColor.PremiumColor, RootColor.TextToSpeech], "RGB"),
            opacity: interpolate(animationRecord.value, [0, 1], [0, 1]),
            marginRight: interpolate(animationRecord.value, [0, 1], [HS._10, 0]),
            borderTopRightRadius: interpolate(animationRecord.value, [0, 1], [MHS._16, 0]),
            borderBottomRightRadius: interpolate(animationRecord.value, [0, 1], [MHS._16, 0]),
        })
    }, [])

    const recordBtnAniStyle = useAnimatedStyle(() => {
        return ({
            backgroundColor: interpolateColor(animationBackgroundColor.value, [0, 1], [RootColor.PremiumColor, RootColor.TextToSpeech], "RGB"),
            borderTopLeftRadius: interpolate(animationRecord.value, [0, 1], [MHS._16, 0]),
            borderBottomLeftRadius: interpolate(animationRecord.value, [0, 1], [MHS._16, 0]),
        })
    }, [])


    const textInputAniStyle = useAnimatedStyle(() => {
        return ({
            width: interpolate(animationTyping.value, [0, 1], [Device.width - (HS._16 * 2) - HS._58, Device.width - (HS._16 * 2)]),
            marginRight: interpolate(animationTyping.value, [0, 1], [HS._10, HS._18]),
        })
    }, [])

    const sendBtnAniStyle = useAnimatedStyle(() => {
        return ({
            transform: [{scale: interpolate(animationTyping.value, [0, 1], [0, 1])}]
        })
    }, [])

    const onRecord = () => {
        Keyboard.dismiss();

        if (isSpeeching) {
            onStopSpeeching();
        } else {
            onPressRecord();
        }
    }

    return (
        <View style={[styles.container]}>
            <View style={styles.viewInput}>
                <Animated.View style={[styles.viewTextInput, textInputAniStyle]} pointerEvents={isRecording || isSpeeching || isLoadingSpeech || isLoadingVoice ?"none":'auto'}>
                    <TextInput
                        ref={refInput}
                        autoFocus={false}
                        multiline
                        maxLength={500}
                        style={[styles.textInput, {color: theme.textDark}]}
                        placeholder={languages.homeScreen.placeHolder}
                        placeholderTextColor={theme.textInactive}
                        onChangeText={onChangeText}
                    />
                    <AniPressable
                        style={sendBtnAniStyle}
                        hitSlop={HIT_SLOP_EXPAND_10}
                        onPress={onSendText}>
                        <IconSend size={HS._32} color={theme.btnActive}/>
                    </AniPressable>
                </Animated.View>
                <Animated.View style={[styles.viewWave, waveViewAniStyle]} pointerEvents={'none'}>
                    {
                        (isLoadingVoice || isLoadingSpeech) ?
                            <LottieView source={LOADING_WAVE}
                                        autoPlay
                                        loop
                                        speed={1.5}
                                        style={styles.loadingWave}/>
                            :
                            (
                                isRecording ?
                                    <LottieView source={WAVE}
                                                autoPlay
                                                loop
                                                speed={0.5}
                                                style={{width: "90%"}}/>
                                    :
                                    <>
                                        <LottieView source={WAVE_SPEECH}
                                                    autoPlay
                                                    colorFilters={pathColorWaveSpeech}
                                                    loop
                                                    speed={0.5}
                                                    style={styles.waveSpeech1}/>
                                        <LottieView source={WAVE_SPEECH}
                                                    autoPlay
                                                    colorFilters={pathColorWaveSpeech}
                                                    loop
                                                    speed={0.5}
                                                    style={styles.waveSpeech2}/>
                                    </>

                            )
                    }

                </Animated.View>
            </View>


            <Animated.View style={[styles.viewRightBtn, recordBtnAniStyle]}>
                <Pressable
                    hitSlop={HIT_SLOP_EXPAND_10}
                    onPress={onRecord}
                >
                    {(isLoadingVoice || isLoadingSpeech) ?
                        null
                        :
                        ((isRecording || isSpeeching) ?
                            <View style={styles.stylePause}/>
                            :
                            <IconMic size={MHS._24} color={"#EAEAEA"}/>)}

                </Pressable>
                {(!isPremium && freeVoice <= 0 && !isSpeeching && !isLoadingSpeech) &&
                    <IconLock style={{position: 'absolute', bottom: MHS._6, right: MHS._6}} size={FontSizes._12}/>}

            </Animated.View>
        </View>
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            marginBottom: Device.paddingBottom,
            paddingHorizontal: HS._16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: VS._8
        },
        waveSpeech1: {
            width: "40%",
            right: -HS._1
        },
        waveSpeech2: {
            width: "40%",
            left: -HS._1
        },
        loadingWave: {
            height: "100%",
            marginLeft: HS._16
        },
        viewInput: {
            flexDirection: 'row',
            height: MHS._43,
        },
        viewTextInput: {
            // flex: 1,
            flexDirection: 'row',
            borderRadius: MHS._16,
            alignItems: 'center',
            paddingHorizontal: HS._16,
            backgroundColor: "#EAEAEA",
            justifyContent: "center"
        },
        viewWave: {
            flex: 1,
            height: '100%',
            position: 'absolute',
            right: 0,
            left: 0,
            borderRadius: MHS._16,
            alignItems: 'center',
            backgroundColor: RootColor.PremiumColor,
            justifyContent: "center",
            flexDirection: 'row'
        },
        viewRightBtn: {
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: MHS._16,
            paddingHorizontal: HS._12,
            backgroundColor: RootColor.PremiumColor,
            overflow: 'hidden',
            width: HS._48
        },
        btnIconInput: {
            paddingHorizontal: HS._6,
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            paddingVertical: VS._8,
        },
        textInput: {
            paddingVertical: VS._6,
            fontSize: HS._14,
            flex: 1,
            maxHeight: VS._80,
            color: "#545454",
            ...FontWeights.Bold_400_SVN
        },
        btnIconInputSend: {
            justifyContent: "center",
            alignItems: "flex-end",
            borderRadius: MHS._40,
        },
        stylePause: {
            width: MHS._18,
            height: MHS._18,
            backgroundColor: "#EAEAEA",
            borderRadius: MHS._4,
            margin: MHS._2
        }
    })
}

export default forwardRef(KeyboardInput);
