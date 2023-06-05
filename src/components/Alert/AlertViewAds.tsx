import { IconClose } from 'assets/svgIcons';
import { EnumAnalyticEvent } from 'constants/anlytics.constant';
import { HIT_SLOP_EXPAND_20 } from 'constants/system.constant';
import { logEventAnalytics, mhs, useSystem, verticalScale } from 'helpers/system.helper';
import AnimatedLottieView from 'lottie-react-native';
import React, { ReactNode, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, useMemo } from 'react';
import isEqual from 'react-fast-compare';

import {
    BackHandler,
    Pressable,
    StyleSheet,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle
} from 'react-native';
import { Device } from 'ui/device.ui';
import { FontWeights, HS, MHS, VS } from 'ui/sizes.ui';

import BottomSheet from "@gorhom/bottom-sheet";
import { useAppDispatch } from 'configs/store.config';
import {setFirstInstall, setStateToImpression} from 'store/reducer/system.reducer.store';
import TextBase from '../TextBase';
import { OverlayProps } from '../common/Overlay';
import AdsNativeAlertView from './component/ads.native';
import { GlobalPopupHelper } from 'helpers/index';

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
}


const WIDTH = Math.min(Device.width - HS._32, Device.width - 16)

function AlertViewComponent(props: AlertViewProps, ref: React.Ref<TypedAlert>) {
    const {
        width = WIDTH,
        borderRadius = mhs(13, 0.3),
        styleMessage = {},
    } = props;
    const [alertContent, setAlertContent] = useState<any>()
    const _mounted = useRef(false);
    const { theme } = useSystem();
    const [firstLoad, setFirstLoad] = useState<boolean>(false);
    const refNativeAds = useRef<any>()
    const bottomSheetRef = useRef<BottomSheet>(null);
    const dispatch = useAppDispatch();
    const [startup, setStartup] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setFirstLoad(true);
        }, 500)
    }, [])

    useEffect(() => {
        if (startup) {
            setTimeout(() => {
                bottomSheetRef.current?.close()
            }, 500);
        }
    }, [startup])

    useEffect(() => {
        _mounted.current = true;

        setStartup(true)
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

    useEffect(() => {
        if (alertContent) {
            bottomSheetRef.current?.expand({ duration: 500 })
            setTimeout(() => {
                dispatch(setStateToImpression({}))
            }, 500);
        } else {
            refNativeAds.current?.loadAd()
        }
    }, [alertContent])


    useImperativeHandle(ref, () => ({
        close: () => {
            bottomSheetRef.current?.close({ duration: 500 })
        },
        alert: (content) => {
            if (!alertContent) {
                setAlertContent(content)
            }

        }
    }), [alertContent]);

    const snapPoints = useMemo(() => [0.001, Device.heightSafeWithStatus], []);

    const onDismissModal = useCallback(() => {
        bottomSheetRef.current?.close({ duration: 500 })
    }, []);

    const onDismissModalDone = useCallback(() => {
        setTimeout(() => {
            alertContent?.onClose?.()
            setAlertContent(undefined)
        }, 300);
    }, [alertContent?.onClose])

    if (!startup) {
        return null
    }

    if (!firstLoad){
        return null
    }

    return (
        <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            enableHandlePanningGesture={false}
            enableContentPanningGesture={false}
            onClose={onDismissModalDone}
            animateOnMount={false}
            handleComponent={null}
            // style={{ flex: 1 }}
            backgroundStyle={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
            <View pointerEvents='box-none' style={[styles.container]}>
                <View style={[styles.viewContent, { width, borderRadius, backgroundColor: theme.background }]}>
                    {
                        <View style={styles.viewContentMessage}>
                            <Pressable style={{ alignSelf: "flex-start", paddingHorizontal: HS._16 }}
                                       hitSlop={HIT_SLOP_EXPAND_20} onPress={onDismissModal}>
                                <IconClose size={MHS._20} color={theme.text} />
                            </Pressable>
                            <TextBase title={alertContent?.title} fontSize={20} fontWeight="700" style={[styles.txtTitle]} />
                            {
                                !alertContent?.actions?.[0] ? (
                                    <View>
                                        <AnimatedLottieView
                                            source={require("assets/lotties/congratulations.json")}
                                            style={{ width: WIDTH, height: VS._60 }}
                                            autoPlay
                                            loop
                                        />
                                    </View>
                                ) : null
                            }
                            {
                                alertContent?.message != null ? <TextBase title={alertContent?.message} fontSize={16}
                                                                          style={[styles.txtMessage, styleMessage, alertContent?.title ? { marginTop: 25 } : undefined]} /> : null
                            }


                            <AdsNativeAlertView
                                onAdClicked={() => {
                                    GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd()
                                    logEventAnalytics(alertContent?.actions?.[0] ? EnumAnalyticEvent.PressAdsPrev : EnumAnalyticEvent.PressAdsAfter)
                                }}
                                ref={refNativeAds}
                                onAddImpression={() => {
                                    logEventAnalytics(alertContent?.actions?.[0] ? EnumAnalyticEvent.ImpressionAdsPrev : EnumAnalyticEvent.ImpressionAdsAfter)
                                }}
                            />
                            {
                                alertContent?.actions?.[0] ? (
                                    <View
                                        style={[styles.viewButton, width ? { width } : {}, { borderTopColor: theme.btnLightSmoke }]}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                onDismissModal();
                                                setTimeout(() => {
                                                    alertContent?.actions?.[0]?.onPress?.();
                                                }, 500);
                                            }}
                                            style={[styles.button, alertContent?.actions?.[0]?.style]}
                                        >
                                            <TextBase title={alertContent?.actions?.[0]?.text} color={theme.text}
                                                      fontSize={16}
                                                      style={[styles.txtButton, alertContent?.actions?.[0]?.titleStyle]} />
                                        </TouchableOpacity>
                                    </View>
                                ) : <View style={{ height: VS._20 }} />
                            }
                        </View>

                    }
                </View>
            </View>
        </BottomSheet>
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
        textAlign: "center",
        marginTop:VS._10
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
