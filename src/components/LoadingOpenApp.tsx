import {useAppSelector} from 'configs/store.config';
import {NAVIGATION_CHOOSE_COUNTRY_SCREEM} from 'constants/router.constant';
import {GlobalPopupHelper} from 'helpers/index';
import {useDisplayAds, useSystem} from 'helpers/system.helper';
import AnimatedLottieView from 'lottie-react-native';
import React, {forwardRef, useEffect, useImperativeHandle, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import Modal from "react-native-modal";
import {Device} from 'ui/device.ui';
import {FontSizes, MHS, VS} from 'ui/sizes.ui';
import {RootColor, SystemTheme} from 'ui/theme';
import TextBase from './TextBase';
import dayjs from "dayjs";

const LoadingOpenApp = (_, ref) => {
    const {styles} = useSystem(createStyles)
    const lastChoiceCountry = useAppSelector(state => state.system.lastChoiceCountry)
    const isLoadedConfig = useAppSelector(state => state.control.isLoadedConfig)
    const {native_ads_country} = useDisplayAds()
    const [visible, setVisible] = useState(true)

    useImperativeHandle(ref, () => ({
        hide: () => {
            setTimeout(() => {
                setVisible(false)
            }, 500);
        },
        state: visible
    }), [visible])

    useEffect(() => {
        if (isLoadedConfig) {
            setTimeout(() => {
                setVisible(false)
            }, 15000);
            setTimeout(()=>{
                navigate()
            },1000)
        }

    }, [isLoadedConfig])


    const navigate = () => {
        console.log("navigate =======================");

        if (native_ads_country && (lastChoiceCountry === undefined || dayjs().diff(dayjs(lastChoiceCountry), "minutes") > 4320)) {
            GlobalPopupHelper.admobGlobalRef.current?.showOpenAds(NAVIGATION_CHOOSE_COUNTRY_SCREEM)
            return;
        }

        const intervalCheck = setInterval(() => {
            if (GlobalPopupHelper.admobGlobalRef.current?.checkIsOpenLoad) {
                clearInterval(intervalCheck)
                setVisible(false)
            }
        }, 100)

        console.log("HGoi")
        GlobalPopupHelper.admobGlobalRef.current?.showOpenAds("DrawerNavigator")
    }


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
