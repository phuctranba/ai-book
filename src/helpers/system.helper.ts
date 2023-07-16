import analytics from "@react-native-firebase/analytics";
import firestore from '@react-native-firebase/firestore';
import { useAppSelector } from 'configs/store.config';
import {EnumTheme} from 'constants/system.constant';
import { languages } from 'languages';
import { parsePhoneNumber } from 'libphonenumber-js';
import {useEffect, useMemo, useRef, useState} from 'react';
import { Dimensions, ImageStyle, Linking, Platform, TextStyle, ToastAndroid, ViewStyle } from 'react-native';
import DeviceCountry, {
  TYPE_CONFIGURATION,
} from 'react-native-device-country';
import { SystemTheme } from 'ui/theme';
import DarkTheme from 'ui/theme/dark.theme';
import LightTheme from 'ui/theme/light.theme';
import { v4 as uuidv4 } from "uuid";
import { GlobalPopupHelper } from '.';
// import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import Toast from "react-native-simple-toast";
import DeviceInfo from "react-native-device-info";

const {width, height} = Dimensions.get("window");
export const LANGUAGE_SYSTEM = languages.getInterfaceLanguage()

export const SUBSCRIPTIONS = Platform.select({
    android: ["com.zipenter.aibook.subscription.month"],
    ios: ["com.zipenter.aibook.subscription.1month"]
}) || []

export const PRODUCTS = ["com.zipenter.aibook.donate.1usd", "com.zipenter.aibook.donate.5usd"]


const [short, long] = width > height ? [height, width] : [width, height]

export const horizontalScale = (size = 0) => size * short / 375;
export const verticalScale = (size = 0) => size * long / 812;
/**
 * moderateHorizontalScale
 * @param size
 * @param factor
 * Scale by screen horizontal ratio with factor for size compensation. Default factor is 0.5.
 */
export const mhs = (size, factor = 0.5) => size + (horizontalScale(size) - size) * factor;

/**
 * moderateVerticalScale
 * @param size
 * @param factor
 * Scale by screen vertical ratio with factor for size compensation. Default factor is 0.5.
 */
export const mvs = (size, factor = 0.5) => size + (verticalScale(size) - size) * factor;

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useSystem<T extends NamedStyles<T> | NamedStyles<any>>(createStyle?: (theme: SystemTheme) => T): {
    theme: SystemTheme
    themeKey: EnumTheme
    styles: T
    isConnected: boolean
} {
    const themeKey = useAppSelector((state) => state.system.theme);
    const isConnected = useAppSelector((state) => state.system.isConnectedInternet);

    const theme = themeKey === EnumTheme.Dark ? DarkTheme : LightTheme;
    const styles = useMemo(() => {
        return createStyle?.(theme) || {} as T
    }, [theme]);

    return {theme, themeKey, styles, isConnected}
}

export const sleep = async (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout))
}

export const openURLWebView = async (url: string) => {
    if (!url) {
        return;
    }
    try {
        // if (await InAppBrowser.isAvailable()) {
        //   const result = await InAppBrowser.open(url, {
        //     // iOS Properties
        //     dismissButtonStyle: 'cancel',
        //     preferredBarTintColor: "#46B18F",
        //     preferredControlTintColor: 'white',
        //     readerMode: false,
        //     animated: true,
        //     modalPresentationStyle: 'fullScreen',
        //     modalTransitionStyle: 'coverVertical',
        //     modalEnabled: true,
        //     enableBarCollapsing: false,
        //     // Android Properties
        //     showTitle: true,
        //     toolbarColor: "#46B18F",
        //     secondaryToolbarColor: 'black',
        //     navigationBarColor: 'black',
        //     navigationBarDividerColor: 'white',
        //     enableUrlBarHiding: true,
        //     enableDefaultShare: true,
        //     forceCloseOnRedirection: false,
        //     // Specify full animation resource identifier(package:anim/name)
        //     // or only resource name(in case of animation bundled with app).
        //     animations: {
        //       startEnter: 'slide_in_right',
        //       startExit: 'slide_out_left',
        //       endEnter: 'slide_in_left',
        //       endExit: 'slide_out_right'
        //     },
        //     headers: {

        //     }
        //   })
        //   await sleep(800);
        //   console.log("result", result);
        //   return;
        // }
        Linking.openURL(url)
    } catch (error) {
        Linking.openURL(url)
    }

}

export const validPhoneNumber = (phoneNumber?: string, countryCode?: string) => {
    if (!phoneNumber || !countryCode) {
        return false;
    }
    try {
        //@ts-ignore
        const phoneNumber1 = parsePhoneNumber(phoneNumber, countryCode)
        if (phoneNumber1.isValid()) {
            return true
        }
        return false
    } catch (error) {
        return false
    }
}

export const useDisplayAds = () => {
    const config = useAppSelector(state => state.system.config);
    const nativeAdsId = useAppSelector(state => state.system.nativeAdsId);
    const rewardAdsId = useAppSelector(state => state.system.rewardAdsId);
    const openAdsId = useAppSelector(state => state.system.openAdsId);
    const bannerAdsId = useAppSelector(state => state.system.bannerAdsId);

    const {
        native_ads_pre,
        native_ads_after,
        use_reward_ads
    } = config;


    const displayAlertAds = ({
                                 title,
                                 message,
                                 callback,
                                 notGoPremium = false,
                                 useReward = true,
                                 textConfirm = ""
                             }: { title: string, message: string, callback?: Function, notGoPremium?: boolean, useReward?: boolean, textConfirm?: string }) => {
        const alertPre = native_ads_pre ? GlobalPopupHelper.alertAdsRef.current : GlobalPopupHelper.alertRef.current;
        const alertAfter = native_ads_after ? GlobalPopupHelper.alertAdsRef.current : GlobalPopupHelper.alertRef.current;

        alertPre?.alert({
            title,
            message,
            actions: [{
                text: textConfirm || languages.confirm,
                active: true,
                onPress: () => {
                    if (use_reward_ads && useReward) {
                        GlobalPopupHelper.adsRewardRef.current?.showAds(() => {
                            setTimeout(() => {
                                alertAfter?.alert({
                                    title: languages.unlockPremiumFeature,
                                    message: languages.successfulAward,
                                    onClose: () => {
                                        callback?.();
                                    }
                                });
                            }, 500);
                        }, notGoPremium);
                    } else {
                        callback?.();
                    }
                }
            }]
        });
    };

    return { displayAlertAds, ...config, nativeAdsId, rewardAdsId, openAdsId, bannerAdsId };
};

export const useNativeAds = () => {
    const config = useAppSelector(state => state.system.config);
    const listNativeAdsId = useAppSelector(state => state.system.listNativeAdsId);

    const [nativeAdsId, setNativeAdsId] = useState<any>(listNativeAdsId?.[0]);
    const refNativeAdsId = useRef<any>(listNativeAdsId?.[0]);

    useEffect(() => {
        if (refNativeAdsId.current !== listNativeAdsId?.[0]) {
            setNativeAdsId(listNativeAdsId?.[0]);
            refNativeAdsId.current = listNativeAdsId?.[0];
        }
    }, [listNativeAdsId]);


    const switchAdsId = () => {
        let newAdsId;
        let indexOfCurrentKey = listNativeAdsId.indexOf(refNativeAdsId.current);
        if (indexOfCurrentKey === -1) {
            newAdsId = listNativeAdsId?.[0];
        } else {
            if (indexOfCurrentKey === listNativeAdsId.length - 1) {
                refNativeAdsId.current = undefined;
                setNativeAdsId(undefined);
                return;
            }

            if (listNativeAdsId.length >= indexOfCurrentKey + 2) {
                newAdsId = listNativeAdsId?.[indexOfCurrentKey + 1];
            } else {
                newAdsId = listNativeAdsId?.[0];
            }
        }

        refNativeAdsId.current = newAdsId;
        setNativeAdsId(newAdsId);
    };

    return { ...config, nativeAdsId, switchAdsId };
};

export const logEventAnalytics = async (event: string, dataObj = {}) => {
  try {
    if (__DEV__) {
      return;
    }
    return await analytics().logEvent(event, dataObj);
  } catch (error) {

    }
    return;
}

export const sendEventToFirestore = async ({
                                               eventName,
                                               user_id = "",
                                               user_email = "",
                                               fullname = "",
                                               params = {}
                                           }: { eventName: string, user_id?: string, user_email?: string, fullname?: string, params?: any }) => {
    if (!user_id) {
        return
    }
    let countryCode
    try {
        countryCode = await DeviceCountry.getCountryCode(TYPE_CONFIGURATION)
    } catch (error) {

    }
    try {
        const channelDoc = await firestore().collection('Users').doc(uuidv4());
        await channelDoc.set({
            event_name: eventName,
            email: user_email,
            user_id: user_id,
            fullname,
            country: countryCode?.code || "",
            ...params
        })
    } catch (error) {
    }

}

export const NAME_CHAT_GPT = Platform.select({
    ios: "ChatAI Bot",
    android: "ChatGPT"
}) || ""

export const showToast = (text: string) => {
    if (Platform.OS == "android") {
        ToastAndroid.show(text, ToastAndroid.BOTTOM)
    } else {
        Toast.showWithGravity(text, Toast.SHORT, Toast.BOTTOM);
    }
}
