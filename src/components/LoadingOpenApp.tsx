import {useAppDispatch, useAppSelector} from 'configs/store.config';
import {NAVIGATION_CHOOSE_COUNTRY_SCREEM, NAVIGATION_PREMIUM_SERVICE_SCREEN} from 'constants/router.constant';
import {GlobalPopupHelper} from 'helpers/index';
import {logEventAnalytics, SUBSCRIPTIONS, useDisplayAds, useSystem} from 'helpers/system.helper';
import AnimatedLottieView from 'lottie-react-native';
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import Modal from "react-native-modal";
import {Device} from 'ui/device.ui';
import {FontSizes, MHS, VS} from 'ui/sizes.ui';
import {RootColor, SystemTheme} from 'ui/theme';
import TextBase from './TextBase';
import dayjs from "dayjs";
import {useIAP} from "react-native-iap";
import {setIsPremium, setSubscriptionIds, setUseNormalSummary} from "store/reducer/system.reducer.store";
import navigationHelper from "helpers/navigation.helper";
import {EnumAnalyticEvent} from "constants/anlytics.constant";

const LoadingOpenApp = (_, ref) => {
    const {styles} = useSystem(createStyles)
    const lastChoiceCountry = useAppSelector(state => state.system.lastChoiceCountry)
    const isPremium = useAppSelector(state => state.system.isPremium)
    const isLoadedConfig = useAppSelector(state => state.control.isLoadedConfig)
    const {native_ads_country, use_open_ads} = useDisplayAds()
    const [visible, setVisible] = useState(true)
    const { availablePurchases, getAvailablePurchases } = useIAP();
    const dispatch =useAppDispatch()
    const checkPremiumTwoTime = useRef(0)
    const alreadyNavigate = useRef(false)
    const subscriptionIds = useAppSelector(state => state.system.subscriptionIds)
    const refTimeoutToGo = useRef<any>()

    useImperativeHandle(ref, () => ({
        hide: () => {
            setTimeout(() => {
                setVisible(false)
            }, 500);
        },
        state: visible
    }), [visible])

    useEffect(() => {
        GlobalPopupHelper.alertAdsRef.current?.close();
        logEventAnalytics(EnumAnalyticEvent.Loading)
        const getListSubscription = async () => {
            try {
                await getAvailablePurchases()
            } catch (error) {
                console.log("init error", error)
            }
        }
        refTimeoutToGo.current = setTimeout(() => {
            navigate()
        }, 15000);
        getListSubscription()
    }, [])

    useEffect(() => {
        if (checkPremiumTwoTime.current < 2) {
            checkPremiumTwoTime.current += 1
        }

        if (checkPremiumTwoTime.current == 2 && !alreadyNavigate.current && isLoadedConfig) {
            alreadyNavigate.current = true
            const intervalCheck = setInterval(() => {
                if (isPremium || GlobalPopupHelper.admobGlobalRef.current?.checkIsOpenLoad || use_open_ads === false) {
                    clearInterval(intervalCheck)
                    if(refTimeoutToGo.current){
                        clearTimeout(refTimeoutToGo.current)
                    }
                    navigate()
                }
            }, 100)
        }
    }, [availablePurchases, isLoadedConfig, use_open_ads])



    const navigate = () => {
        console.log("navigate =======================");

        const isPremiumCheckFast = (Array.isArray(availablePurchases) && availablePurchases.find(item => SUBSCRIPTIONS.find(i => i == item?.productId)) ? true : false)
        dispatch(setIsPremium(isPremiumCheckFast))
        dispatch(setUseNormalSummary(!isPremiumCheckFast))
        if (isPremiumCheckFast) {
            navigationHelper.replace("DrawerNavigator")
            setTimeout(() => {
                setVisible(false)
            }, 1000);
            return;
        }

        if (native_ads_country && (lastChoiceCountry === undefined || dayjs().diff(dayjs(lastChoiceCountry), "minutes") > 4320)) {
            GlobalPopupHelper.admobGlobalRef.current?.showOpenAds(NAVIGATION_CHOOSE_COUNTRY_SCREEM)
            return;
        }
        GlobalPopupHelper.admobGlobalRef.current?.showOpenAds(NAVIGATION_PREMIUM_SERVICE_SCREEN)
        setVisible(false)
    }

    useEffect(() => {
        if (subscriptionIds.length == 0) {
            dispatch(setSubscriptionIds(SUBSCRIPTIONS))
        }
    }, [])

    return (
        <Modal
            isVisible={visible}
            animationOutTiming={500}
            animationOut={"fadeOutDown"}
            backdropTransitionInTiming={300}
            backdropTransitionOutTiming={0}
            hideModalContentWhileAnimating={false}
            propagateSwipe
            statusBarTranslucent
            deviceHeight={Device.heightScreen}
            style={{margin: 0, padding: 0}}
        >
            <View style={styles.container}>
                <Image
                    source={require("assets/images/logo.png")}
                    style={Device.isAndroid ? {width: Device.width, height: Device.width, tintColor: RootColor.MainColor} : {
                        width: MHS._140,
                        height: MHS._140,
                        borderRadius: MHS._16,
                        tintColor: RootColor.MainColor
                    }}/>

                <View style={{position: "absolute", bottom: VS._18, alignItems: "center"}}>
                    <TextBase
                        title={"This action may contain ads..."}
                        style={{
                            color: RootColor.DarkBackground,
                            fontSize: FontSizes._14,
                            marginBottom: VS._6
                        }}
                    />

                    <AnimatedLottieView
                        source={require("assets/lotties/loadingSplash.json")}
                        style={{width: Device.width * 0.9}}
                        loop
                        speed={0.6}
                        autoPlay/>
                </View>
            </View>
        </Modal>
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center"
        }
    })
}

export default forwardRef(LoadingOpenApp);
