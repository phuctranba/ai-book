import React, {
    createRef,
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react";
import {Animated, Linking, Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Device} from "ui/device.ui";
import {FontSizes, FontWeights, HS, MHS, VS} from "ui/sizes.ui";
import LottieView from "lottie-react-native";
import {useSystem} from "helpers/system.helper";
import {RootColor, SystemTheme} from "ui/theme";
import TextBase from "components/TextBase";
import FastImage from 'react-native-fast-image';
import {Shadow2} from "ui/shadow.ui";
import {languages} from 'languages';
import {useAppDispatch} from "configs/store.config";
import {setIsPressRate} from "store/reducer/system.reducer.store";

interface IButtonPopupProps {
    content: string;
    backgroundColor?: string;
    onPress?: Function
}

interface IPopupProps {
    iconPopup?: JSX.Element;
    content: string[];
    rightBtn: IButtonPopupProps;
    leftBtn?: IButtonPopupProps;
}

const ListEmoji = [
    {
        emoji: require("assets/lotties/rate1.json"),
        point: 1
    },
    {
        emoji: require("assets/lotties/rate2.json"),
        point: 2
    },
    {
        emoji: require("assets/lotties/rate3.json"),
        point: 3
    },
    {
        emoji: require("assets/lotties/rate4.json"),
        point: 4
    },
    {
        emoji: require("assets/lotties/rate5.json"),
        point: 5
    },
]

export const GlobalPopupApp = forwardRef((props, ref) => {
    const {styles, theme} = useSystem(createStyles);
    const dispatch = useAppDispatch()


    const [isLoading, setLoading] = useState(false);
    const [isProgress, setIsProgress] = useState(false);
    const [progressContent, setProgressContent] = useState<string>("");
    const [isShowPopup, setIsShowPopup] = useState(false);
    const [isShowRating, setIsShowRating] = useState(false);
    const [pointRate, setPointRate] = useState<number>(-1);
    const refIconPopup = useRef<any>();
    const refContentPopup = useRef<string[]>();
    const refLeftBtnPopup = useRef<IButtonPopupProps>();
    const refRightBtnPopup = useRef<IButtonPopupProps>();
    const refRateItem = useMemo(() => ListEmoji.map(() => createRef<any>()), []);


    const counter = useRef(new Animated.Value(0)).current;
    const countInterval: any = useRef<any>(null);
    const [count, setCount] = useState<number>(0);


    let _timeout: any = null;
    useImperativeHandle(
        ref,
        () => ({
            showLoading,
            showProgress,
            hideLoading,
            hideProgress,
            showPopup,
            showRate
        }),
        []
    );

    const showRate = (autoHide: boolean = true) => {
        setIsShowRating(true);
        setIsShowPopup(false);
        setLoading(false);
    };

    const showLoading = (autoHide: boolean = true) => {
        setIsShowPopup(false);
        setLoading(true);
        /**
         * Jamviet.com refactor:
         * Auto hide Loading if loading more than 6 seconds
         */
        if (autoHide) {
            _timeout = setTimeout(() => {
                setLoading(false);
                clearTimeout(_timeout);
            }, 10000);
        }
    };

    /**
     * Show progress bar
     */


    const showProgress = (content: string, autoHide: boolean = true) => {
        setCount(0);
        setIsProgress(true);
        setLoading(false);
        setIsShowPopup(false);
        setProgressContent(content);
        if (autoHide) {
            _timeout = setTimeout(() => {
                hideProgress();
                clearTimeout(_timeout);
            }, 30000);
        }
    }

    const hideLoading = () => {
        setLoading(false);
    };

    const hideProgress = () => {
        setCount(0);
        setIsProgress(false);
        setLoading(false);
        setIsShowPopup(false);
    }

    const showPopup = ({iconPopup, content, leftBtn, rightBtn}: IPopupProps) => {
        refIconPopup.current = iconPopup;
        refContentPopup.current = content;
        refRightBtnPopup.current = rightBtn;
        refLeftBtnPopup.current = leftBtn;
        setLoading(false);
        setIsShowPopup(true);
    };

    useEffect(() => {
        if (isProgress) {
            countInterval.current = setInterval(() => setCount((old) => old + 1), 1000);
            return () => {
                clearInterval(countInterval);
            };
        } else {
            return;
        }
    }, [isProgress]);

    useEffect(() => {
        if (isProgress) {
            load(count)
            if (count >= 100) {
                setCount(100);
                // setIsProgress(false);
                clearInterval(countInterval);
            }
        } else {
            return;
        }
    }, [count, isProgress]);

    const load = (count: number) => {
        Animated.timing(counter, {
            toValue: count,
            duration: 500,
            useNativeDriver: false,
        }).start();
    };

    const width = counter.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
        extrapolate: "clamp"
    })


    useEffect(() => {
        if (isProgress) {
            countInterval.current = setInterval(() => setCount((old) => old + 1), 1000);
            return () => {
                clearInterval(countInterval);
            };
        } else {
            return;
        }
    }, [isProgress]);

    useEffect(() => {
        if (isProgress) {
            load(count)
            if (count >= 100) {
                setCount(100);
                // setIsProgress(false);
                clearInterval(countInterval);
            }
        } else {
            return;
        }
    }, [count, isProgress]);

    const onPressBtnLeft = useCallback(() => {
        if (typeof refLeftBtnPopup?.current?.onPress === 'function')
            refLeftBtnPopup.current.onPress();
        setIsShowPopup(false)
    }, [])

    const onPressBtnRight = useCallback(() => {
        if (typeof refRightBtnPopup?.current?.onPress === 'function')
            refRightBtnPopup.current.onPress();
        setIsShowPopup(false)
    }, [])

    const onPressRate = useCallback((index: number) => {
        setPointRate(index);
        refRateItem[index].current?.play();
    }, [])

    const renderRate = (item: { emoji: any, point: number }, index: number) => {
        return (
            <TouchableOpacity
                activeOpacity={0.5}
                key={item.point.toString()}
                onPress={() => onPressRate(index)}
                style={{
                    padding: MHS._4,
                    backgroundColor: pointRate === index ? RootColor.MainColor : RootColor.WhiteSmoke,
                    borderRadius: MHS._50,
                    marginHorizontal: HS._4
                }}>
                <LottieView speed={1.5}
                            loop={false}
                            ref={refRateItem[index]}
                            source={item.emoji}
                            style={{width: MHS._46, height: MHS._46}}/>
            </TouchableOpacity>
        )
    }

    const onRate = () => {
        if (pointRate <= 2) {
            Linking.openURL('mailto:support@appuni.io?subject=ChatGPT_Feedback')
        } else {
            dispatch(setIsPressRate(true))
            if (Device.isAndroid) {
                Linking.openURL(`https://play.google.com/store/apps/details?id=com.iceo.aichat`)
            } else {
                Linking.openURL("itms-apps://apps.apple.com/us/app/chatai-bot-assistant/id6446157680")
            }
        }
        hideRate()
    }

    const hideRate = () => {
        setIsShowRating(false);
        setPointRate(-1);
    }

    return (
        <View style={styles.container}>
            {isLoading &&
                <View style={styles.containerMain}>
                    <LottieView
                        source={require('assets/lotties/loading.json')}
                        style={{width: MHS._140}}
                        loop
                        speed={1.5}
                        autoPlay
                    />
                </View>}

            {isProgress &&
                <>
                    <View style={styles.containerProgress}>
                        <Text
                            style={styles.textProgress}>{progressContent ? progressContent : "Loading"}</Text>
                        <View style={styles.progressBar}>
                            <Animated.View style={Object.assign(
                                {},
                                StyleSheet.absoluteFill,
                                {backgroundColor: '#8BED4F', width}
                            )}/>
                        </View>
                        <Text style={styles.textProgress}>{`${count}%`}</Text>
                    </View>
                </>
            }

            {isShowPopup &&
                <View style={styles.containerMain}>
                    <View style={styles.viewPopup}>
                        {refIconPopup.current}
                        {refContentPopup.current?.map((item, index) => <Text key={index.toString()}
                                                                             style={styles.txtPopup}>{item}</Text>)}
                        <View style={styles.viewBtn}>

                            {refLeftBtnPopup.current &&
                                <TouchableOpacity
                                    onPress={onPressBtnLeft}
                                    style={[styles.btn, {backgroundColor: refLeftBtnPopup?.current?.backgroundColor || theme.btnNegative}]}>
                                    <Text style={styles.txtBtn}>{refLeftBtnPopup?.current?.content || ""}</Text>
                                </TouchableOpacity>
                            }

                            <TouchableOpacity
                                onPress={onPressBtnRight}
                                style={[styles.btn, {backgroundColor: refRightBtnPopup?.current?.backgroundColor || RootColor.MainColor}]}>
                                <Text style={styles.txtBtn}>{refRightBtnPopup?.current?.content || ""}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>}

            {isShowRating &&
                <Pressable style={styles.containerRating} onPress={hideRate}>
                    <Pressable style={styles.viewRating}>
                        <FastImage
                            style={{
                                width: Device.width / 4,
                                height: Device.width / 4,
                                borderRadius: MHS._12,
                                marginBottom: VS._12, ...Shadow2
                            }}
                            source={require("assets/images/logo.png")}
                        />

                        <TextBase fontWeight={"900"} fontSize={FontSizes._22} color={RootColor.DarkBackground}
                                  title={languages.rate.doYouLike}/>
                        <TextBase fontWeight={"900"}
                                  style={{marginBottom: VS._18}}
                                  fontSize={FontSizes._22}
                                  color={RootColor.DarkBackground} title={"ChatGPT - AI Chat bot"}/>

                        <TextBase color={RootColor.LightText} title={languages.rate.workHard}
                                  style={{textAlign: 'center'}}/>
                        <TextBase
                            style={{marginBottom: VS._18, textAlign: 'center'}}
                            color={RootColor.LightText} title={languages.rate.hopeRate}/>

                        <View style={{flexDirection: 'row', marginBottom: VS._38}}>
                            {ListEmoji.map(renderRate)}
                        </View>

                        <TextBase
                            style={{marginBottom: VS._28, textAlign: 'center', marginHorizontal:HS._12}}
                            fontWeight={"900"}
                            color={RootColor.MainColor} title={languages.rate.noShow}/>

                        <TouchableOpacity
                            disabled={pointRate === -1}
                            onPress={onRate}
                            style={[styles.btnRate, {backgroundColor: pointRate !== -1 ? RootColor.MainColor : theme.btnInactive}]}>
                            <Text
                                style={[styles.txtBtn, {fontSize: FontSizes._16}]}>{pointRate <= 2 ? languages.rate.sendFeedBack : languages.rate.rateApp}</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>}

        </View>
    );
});

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            position: 'absolute',
        },
        containerMain: {
            width: Device.width,
            height: Device.heightScreen,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: "center",
            alignItems: "center"
        },
        containerRating: {
            width: Device.width,
            height: Device.heightSafeWithStatus,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: "flex-end",
        },
        containerProgress: {
            flex: 1,
            flexDirection: "column", //column direction
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: HS._12,
            paddingVertical: VS._16,
            backgroundColor: '#5c0384',
            width: Device.width,
            opacity: 0.9,
            height: Device.heightScreen,
        },
        viewPopup: {
            backgroundColor: '#fff',
            borderRadius: MHS._16,
            width: Device.width * 0.8,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: HS._12,
            paddingVertical: VS._16
        },
        viewRating: {
            backgroundColor: '#fff',
            width: "100%",
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: HS._12,
            paddingVertical: VS._28
        },
        txtPopup: {
            color: theme.text,
            fontSize: FontSizes._16,
            textAlign: 'center',
            marginVertical: VS._4,
            ...FontWeights.Bold_400_SVN
        },
        viewBtn: {
            width: '100%',
            justifyContent: 'space-evenly',
            flexDirection: 'row',
            marginTop: VS._12,
            paddingVertical: VS._2
        },
        btn: {
            width: '40%',
            paddingVertical: VS._10,
            alignItems: 'center',
            borderRadius: MHS._30,
        },
        btnRate: {
            width: '80%',
            backgroundColor: RootColor.MainColor,
            paddingVertical: VS._14,
            alignItems: 'center',
            borderRadius: MHS._30,
        },
        txtBtn: {
            color: theme.text,
            fontSize: FontSizes._12,
            ...FontWeights.Bold_500_SVN
        },
        progressBar: {
            height: 20,
            flexDirection: "row",
            width: '100%',
            backgroundColor: 'white',
            borderColor: '#000',
            borderWidth: 2,
            borderRadius: 5
        },
        textProgress: {
            color: 'white',
        }
    })
}

export default memo(GlobalPopupApp);
