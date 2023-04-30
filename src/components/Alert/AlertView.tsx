import { IconClose } from 'assets/svgIcons';
import { HIT_SLOP_EXPAND_20 } from 'constants/system.constant';
import { defaultSpringConfig, defaultTimingConfig } from 'helpers/animation.helper';
import { mhs, useSystem, verticalScale } from 'helpers/system.helper';
import React, { ReactNode, forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import isEqual from 'react-fast-compare';

import {
    BackHandler,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle
} from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Device } from 'ui/device.ui';
import { FontWeights, HS, MHS, VS } from 'ui/sizes.ui';

import TextBase from '../TextBase';
import ModalCustom from '../common/ModalCustom';
import { OverlayProps } from '../common/Overlay';

type AlertAction = {
    text?: string;
    onPress?: (text?: string) => void;
    onPressIn?: () => void;
    autoDismiss?: boolean;
    style?: ViewStyle;
    titleColor?: string;
    titleStyle?: TextStyle;
    disabled?: boolean;
    testIDButton?: string;
    accessibilityLabelButton?: string;
    testIDTitle?: string;
    accessibilityLabelTitle?: string;
    active?: boolean;
}[]

export interface AlertViewProps {
    nativeModal?: boolean;
    visible?: boolean;
    setVisible?: (value: boolean) => void;
    title?: string;
    message?: string;
    actions?: AlertAction;
    width?: number | string;
    borderRadius?: number;
    backgroundColor?: string;
    onOpen?: () => void;
    onClose?: () => void;
    animationType?: 'spring' | 'timing';
    scaleAnimationInit?: number;
    springAnimationConfig?: Object;
    timingAnimationConfig?: Object;
    avoidKeyboard?: boolean;
    renderContent?: () => React.ReactElement;
    renderBackground?: () => ReactNode;
    zIndex?: number | null;
    testIDAlert?: string;
    accessibilityLabelAlert?: string;
    timeDismiss?: number;
    styleMessage?: TextStyle;
    buttonProps?: AlertButtonProps;
    overlayProps?: OverlayProps;
    hasTextInput?: boolean;
    maxLength?: number;
    placeHolderTextInput?: string
    defaultValue?: string
}

interface AlertButtonProps {
    title?: string;
    onPress?: (text?: string) => void;
    style?: ViewStyle;
    disabled?: boolean;
    btnProps?: TouchableOpacityProps;
}

export interface TypedAlert {
    alert: (content: AlertViewProps) => void;
    close: (callback?: (text?: string) => void) => void;
    closeAll: () => void;
}


const SCALE_ANIMATION = Platform.OS === 'ios' ? 1.05 : 1.02;
const WIDTH = Math.min(Device.width - HS._32, Device.width - 16)

function AlertViewComponent(props: AlertViewProps, ref: React.Ref<TypedAlert>) {
    const {
        visible = false,
        setVisible,
        title,
        message,
        actions,
        width = WIDTH,
        borderRadius = mhs(13, 0.3),
        onOpen,
        onClose,
        animationType = 'spring',
        springAnimationConfig = defaultSpringConfig,
        timingAnimationConfig = defaultTimingConfig,
        renderContent,
        renderBackground,
        nativeModal = true,
        avoidKeyboard,
        testIDAlert,
        accessibilityLabelAlert,
        scaleAnimationInit = SCALE_ANIMATION,
        timeDismiss = 100,
        styleMessage = {},
        hasTextInput = false,
        placeHolderTextInput = "",
        defaultValue = "",
        maxLength = undefined
    } = props;
    const progress = useSharedValue(0);
    const scale = useSharedValue(scaleAnimationInit);
    const text = useRef("")
    const _mounted = useRef(false);
    const { theme } = useSystem();
    const textInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible) {
            if (hasTextInput) {
                textInputRef.current?.focus()
            }

            if (animationType === 'timing') {
                progress.value = withTiming(1, timingAnimationConfig);
                scale.value = withTiming(1, timingAnimationConfig, () => {
                    if (onOpen) {
                        runOnJS(onOpen)()
                    }
                });
            } else {
                progress.value = withSpring(1, springAnimationConfig);
                scale.value = withSpring(1, springAnimationConfig, () => {
                    if (onOpen) {
                        runOnJS(onOpen)()
                    }
                });
            }
        }
    }, [visible]);

    useEffect(() => {
        _mounted.current = true;
        const backAction = () => {
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => {
            _mounted.current = false;
            backHandler.remove()
        };
    }, []);

    useImperativeHandle(ref, () => ({
        close: () => {
            onDismissModal();
        },
        alert: () => {
        },
        closeAll: () => {
        }
    }));

    const onDismissModal = useCallback((callback?: (text?: string) => void) => {
        if (!setVisible) {
            console.warn('setVisible is required');
        }

        progress.value = withTiming(0, { duration: timeDismiss, easing: Easing.linear }, () => {
            scale.value = SCALE_ANIMATION;
            if (oncancel) {
                runOnJS(oncancel)();
            }
            if (callback) {
                runOnJS(callback)(text.current);
            }
        });
    }, []);

    const oncancel = useCallback(() => {
        if (_mounted.current) {
            setVisible?.(false)
        }
        onClose?.();
    }, [onClose]);



    const contentStyle = useAnimatedStyle(() => {
        return {
            opacity: progress.value,
            transform: [
                { scale: scale.value },
            ],
        };
    });



    return (
        <ModalCustom
            nativeModal={nativeModal}
            visible={visible}
            avoidKeyboard={avoidKeyboard}
            onDismiss={onDismissModal}
        >
            <View pointerEvents='box-none' style={[styles.container]}>
                <Animated.View
                    testID={testIDAlert}
                    accessibilityLabel={accessibilityLabelAlert}
                    style={[styles.viewContent, { width, borderRadius, backgroundColor: theme.background }, contentStyle]}
                >
                    {
                        renderBackground ? (
                            <View style={{ ...StyleSheet.absoluteFillObject, borderRadius, overflow: 'hidden' }}>
                                {typeof renderBackground === 'function' ? renderBackground() : renderBackground}
                            </View>
                        ) : null
                    }
                    {
                        renderContent ? renderContent() : (
                            <View style={styles.viewContentMessage}>
                                <Pressable style={{ alignSelf: "flex-start", paddingHorizontal: HS._16 }}
                                    hitSlop={HIT_SLOP_EXPAND_20} onPress={() => onDismissModal()}>
                                    <IconClose size={MHS._20} color={theme.text} />
                                </Pressable>
                                {
                                    title != null ? <TextBase title={title} fontSize={20} fontWeight="700"
                                        style={[styles.txtTitle]} /> : null
                                }
                                {
                                    message != null ? <TextBase title={message} fontSize={16}
                                        style={[styles.txtMessage, styleMessage, title ? { marginTop: 25 } : undefined]} /> : null
                                }
                                {
                                    hasTextInput ? (
                                        <TextInput
                                            maxLength={maxLength}
                                            ref={textInputRef}
                                            style={[styles.textInput, {
                                                color: theme.textDark,
                                                backgroundColor: theme.backgroundTextInput
                                            }]}
                                            placeholder={placeHolderTextInput || "Enter name"}
                                            placeholderTextColor={theme.textInactive}
                                            defaultValue={defaultValue}
                                            onChangeText={(v) => {
                                                text.current = v
                                            }}
                                        />
                                    ) : null
                                }
                                {
                                    Array.isArray(actions) ? (
                                        <View
                                            style={[styles.viewButton, width ? { width } : {}, { borderTopColor: theme.btnLightSmoke }]}>
                                            {
                                                actions.map((btn, idx) => (
                                                    <React.Fragment key={String(idx)}>
                                                        <TouchableOpacity
                                                            {...btn}
                                                            disabled={btn.disabled || false}
                                                            onPress={() => {
                                                                btn.onPressIn?.();
                                                                if (btn.autoDismiss === false) {
                                                                    if (nativeModal) {
                                                                        setTimeout(() => {
                                                                            btn.onPress?.(text.current);
                                                                        }, 150);
                                                                    } else {
                                                                        btn.onPress?.(text.current);
                                                                    }
                                                                } else {
                                                                    if (nativeModal) {
                                                                        onDismissModal();
                                                                        setTimeout(() => {
                                                                            btn.onPress?.(text.current);
                                                                        }, 150);
                                                                    } else {
                                                                        onDismissModal(btn.onPress);
                                                                    }
                                                                }
                                                            }}
                                                            style={[styles.button, idx > 0 ? {
                                                                ...styles.borderLeft,
                                                                borderLeftColor: theme.btnLightSmoke
                                                            } : {}, btn.style]}
                                                        >
                                                            <TextBase title={btn.text}
                                                                color={btn.active ? theme.textMain : theme.textInactive}
                                                                fontSize={16} fontWeight="700"
                                                                style={[styles.txtButton, btn.titleStyle]} />
                                                        </TouchableOpacity>
                                                    </React.Fragment>
                                                ))
                                            }
                                        </View>
                                    ) : <View style={{ height: VS._20 }} />
                                }
                            </View>
                        )
                    }
                </Animated.View>
            </View>
        </ModalCustom>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: "red"
    },
    viewContent: {
        marginVertical: VS._5,
        marginHorizontal: HS._2,
        flexWrap: 'nowrap',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
        elevation: 2,
    },
    viewContentMessage: {
        alignItems: "center",
        paddingTop: VS._14
    },
    txtTitle: {
        textAlign: "center"
    },
    nativeAdsContainer:{
        width: "100%",
        paddingBottom: MHS._4
    },
    txtMessage: {
        textAlign: "center",
        marginHorizontal: HS._16,
    },
    viewButton: {
        height: VS._50,
        flexDirection: "row",
        marginTop: verticalScale(25),
        borderTopWidth: 0.5,
    },
    viewClose:{
        alignSelf: "flex-start",
        paddingHorizontal: HS._16
    },
    txtButton: {
        textAlign: "center"
    },
    button: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: VS._50
    },
    borderLeft: {
        borderLeftWidth: 0.5,
    },
    textInput: {
        width: WIDTH - HS._32,
        fontSize: HS._16,
        borderRadius: MHS._16,
        color: "#545454",
        marginTop: VS._10,
        paddingVertical: VS._10,
        paddingHorizontal: HS._16,
        ...FontWeights.Bold_400_SVN,
    },
});

export default React.memo(forwardRef(AlertViewComponent), isEqual);
