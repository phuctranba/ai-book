import { useSystem } from 'helpers/system.helper';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SystemTheme } from 'ui/theme';
import { MHS, HS, VS } from 'ui/sizes.ui';
import TextBase from 'components/TextBase';
import Animated, { Extrapolate, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Device } from 'ui/device.ui';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAppDispatch, useAppSelector } from 'configs/store.config';
import TypingText from 'screens/summary/typingText';
import { setSpeedSSEMessage } from 'store/reducer/system.reducer.store';
import { HIT_SLOP_EXPAND_20 } from 'constants/system.constant';
import { languages } from 'languages';

const WIDTH = Device.width - HS._32 - HS._40
const WIDTH_BOX = MHS._24
const QUOTE = "Do the difficult things while they are easy and do the great things while they are small. A journey of a thousand miles begins with a single step."

const SettingsSpeedScreen = () => {
    const { styles, theme } = useSystem(createStyles)

    const speedSSEMessage  = useAppSelector(state => state.system.speedSSEMessage)
    const refTypingText = useRef<any>()
    const translateX = useSharedValue((speedSSEMessage - 1) * (WIDTH / 4) - WIDTH_BOX / 2)
    const dispatch = useAppDispatch()

    useEffect(() => {
        refTypingText.current?.resetText()

        setTimeout(() => {
            refTypingText.current?.setText(QUOTE)
            refTypingText.current?.setDone()
        }, 500);
    }, [speedSSEMessage])

    const styleView = useAnimatedStyle(() => {
        return {
            transform: [{
                translateX: interpolate(translateX.value, [-WIDTH_BOX / 2, WIDTH - WIDTH_BOX / 2], [-WIDTH, 0], Extrapolate.CLAMP)
            }]
        }
    })

    const styleSlider = useAnimatedStyle(() => {
        return {
            transform: [{
                translateX: translateX.value
            }]
        }
    })

    const setSpeed = (sp) => {
        dispatch(setSpeedSSEMessage(sp))
    }

    const gesture = Gesture.Pan()
        .onChange((e) => {
            const translationX = translateX.value + e.changeX;
            translateX.value = Math.min(Math.max(-WIDTH_BOX / 2, translationX), WIDTH - MHS._12);
        })
        .onEnd((e) => {
            const finalIndex = Math.round(translateX.value / (WIDTH / 4))
            translateX.value = withTiming(finalIndex * (WIDTH / 4) - WIDTH_BOX / 2, { duration: 200 }, (f1) => {
                if (f1) {
                    runOnJS(setSpeed)(finalIndex + 1)
                }
            })
        })


    return (
        <View style={styles.container}>
            <View style={[styles.row]}>
                <TextBase title={languages.speedMessageResponse} fontSize={16} style={{ marginHorizontal: -HS._20, marginBottom: VS._20 }} fontWeight="600" />
                <View style={styles.slide}>
                    <Animated.View style={[{ ...StyleSheet.absoluteFillObject, backgroundColor: theme.backgroundMain }, styleView]} />
                    <View />
                </View>
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.slider, styleSlider]} hitSlop={HIT_SLOP_EXPAND_20} />
                </GestureDetector>
                <View style={styles.range}>
                    <View style={{ alignItems: "center" }}>
                        <View style={styles.rangeItem} />
                        <TextBase title={"1"} fontSize={16} fontWeight="600" />
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <View style={styles.rangeItem} />
                        <TextBase title={"2"} fontSize={16} fontWeight="600" />
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <View style={styles.rangeItem} />
                        <TextBase title={"3"} fontSize={16} fontWeight="600" />
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <View style={styles.rangeItem} />
                        <TextBase title={"4"} fontSize={16} fontWeight="600" />
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <View style={styles.rangeItem} />
                        <TextBase title={"5"} fontSize={16} fontWeight="600" />
                    </View>
                </View>
            </View>
            <View style={[styles.messageBubble]}>
                <TypingText ref={refTypingText} speed={speedSSEMessage} />
            </View>
        </View>
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
        },
        slide: {
            height: VS._4,
            width: WIDTH,
            backgroundColor: theme.backgroundTextInput,
            marginTop: VS._10,
            borderRadius: MHS._4,
            overflow: "hidden"
        },
        row: {
            marginHorizontal: HS._16,
            paddingVertical: VS._14,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.btnLightSmoke,
            paddingHorizontal: HS._20
        },
        slider: {
            width: WIDTH_BOX,
            height: WIDTH_BOX,
            backgroundColor: theme.backgroundMain,
            borderRadius: WIDTH_BOX,
            marginTop: -MHS._12,
            zIndex: 10
        },
        range: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: WIDTH + MHS._12,
            marginHorizontal: -MHS._6,
            marginTop: -MHS._20
        },
        rangeItem: {
            width: MHS._12,
            height: MHS._12,
            borderRadius: MHS._12,
            backgroundColor: theme.backgroundTextInput,
            marginBottom: VS._10
        },
        messageBubble: {
            borderRadius: MHS._10,
            marginVertical: VS._5,
            paddingTop: VS._10,
            paddingBottom: VS._6,
            paddingHorizontal: HS._10,
            backgroundColor: `${theme.btnInactive}40`,
            marginHorizontal: HS._16
        }
    })
}

export default SettingsSpeedScreen;
