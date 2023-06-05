import React, {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import {Animated, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Device} from "ui/device.ui";
import {FontSizes, FontWeights, HS, MHS, VS} from "ui/sizes.ui";
import LottieView from "lottie-react-native";
import {SUBSCRIPTIONS, useSystem} from "helpers/system.helper";
import {RootColor, SystemTheme} from "ui/theme";
import {setIsPremium, setUseNormalSummary} from "store/reducer/system.reducer.store";
import {GlobalPopupHelper} from "helpers/index";
import {useIAP} from "react-native-iap";
import {useAppDispatch} from "configs/store.config";

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

export const GlobalPopupApp = forwardRef((props, ref) => {
    const {styles, theme} = useSystem(createStyles);

    const [isLoading, setLoading] = useState(false);
    const [isProgress, setIsProgress] = useState(false);
    const [progressContent, setProgressContent] = useState<string>("");
    const [isShowPopup, setIsShowPopup] = useState(false);
    const refIconPopup = useRef<any>();
    const refContentPopup = useRef<string[]>();
    const refLeftBtnPopup = useRef<IButtonPopupProps>();
    const refRightBtnPopup = useRef<IButtonPopupProps>();


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
            showPopup
        }),
        []
    );

    const dispatch = useAppDispatch();
    const firstTimeCheckIsPremium = useRef(true);

    const { availablePurchases, getAvailablePurchases } = useIAP();

    useEffect(() => {
        GlobalPopupHelper.alertAdsRef.current?.close();
        const getListSubscription = async () => {
            try {
                await getAvailablePurchases();
            } catch (error) {
                console.log("init error", error);
            }
        };

        getListSubscription();
    }, []);

    useEffect(() => {
        if (!firstTimeCheckIsPremium.current) {
            if (Device.isAndroid) {
                const premium = Array.isArray(availablePurchases) && availablePurchases.find(item => SUBSCRIPTIONS.find(i => i == item?.productId)) ? true : false;
                dispatch(setIsPremium(premium));
                dispatch(setUseNormalSummary(!premium))
            } else {
                // const checkPremium = async () => {
                //   const sortedAvailablePurchases = availablePurchases.sort(
                //       (a, b) => b.transactionDate - a.transactionDate
                //   );
                //   try {
                //     const receipt = await validateReceiptIos({
                //       receiptBody: {
                //         "receipt-data": sortedAvailablePurchases[0].transactionReceipt,
                //         password: SHARED_SERCET_KEY_APPLE // app shared secret, can be found in App Store Connect
                //       }
                //     });
                //     const renewalHistory = receipt.latest_receipt_info;
                //     const isSubValid = !!renewalHistory.find(receipt => {
                //       const expirationInMilliseconds = Number(receipt.expires_date_ms);
                //       const nowInMilliseconds = Date.now();
                //       return expirationInMilliseconds > nowInMilliseconds;
                //     });
                //     dispatch(setIsPremium(isSubValid ? true : false));
                // dispatch(setUseNormalSummary(!(isSubValid ? true : false)))
                //   } catch (error) {
                //     dispatch(setIsPremium(false));
                //   }
                // };
                // checkPremium();
            }
        } else {
            firstTimeCheckIsPremium.current = false;
        }
    }, [availablePurchases]);

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
