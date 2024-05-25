import React, {useCallback, useEffect} from "react";
import setupAxiosInterceptors from "configs/axios.config";
import {useAppDispatch, useAppSelector} from "configs/store.config";
import {NativeModules, StatusBar} from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import {firebase} from "@react-native-firebase/analytics";
import {NavigationContainer, NavigationState} from "@react-navigation/native";
import {createStackNavigator, TransitionPresets} from "@react-navigation/stack";
import {EnumTheme} from "constants/system.constant";
import navigationHelper, {navigationRef} from "helpers/navigation.helper";
import {languages} from "languages";
import RNBootSplash from "react-native-bootsplash";
import {
    getSystem,
    setDataEcosystemAdmob,
    setEcosystemConfig,
    setLanguage,
    setSubscriptionIds,
    STATUS_APPLICATION
} from "store/reducer/system.reducer.store";
import {Device} from "ui/device.ui";
import {RootColor} from "ui/theme";
import DisconnectNetworkScreen from "./disconect.network.screen";
import MainNavigator from "./main.navigation";
import remoteConfig from "@react-native-firebase/remote-config";
import {usePurchase} from "helpers/purchase.helper";
import {PRODUCTS, PRODUCTS_QUESTION, SUBSCRIPTIONS, useDisplayAds} from "helpers/system.helper";
import database from '@react-native-firebase/database';
import {GlobalPopupHelper} from "helpers/index";
import SpInAppUpdates from "sp-react-native-in-app-updates";
import {NAVIGATION_HISTORY} from "constants/router.constant";
import DeviceInfo from "react-native-device-info";

const {CustomModule} = NativeModules

setupAxiosInterceptors((status: number) => {
    switch (status) {
        case 401:
            // GlobalPopupHelper.showPopupRequestLogin()
            break;
        case 403:
            // GlobalPopupHelper.showPopupNoPermission()
            break;
    }
});

export type RootStackList = {
    "NAVIGATION_AUTHENTICATION": undefined;
    "NAVIGATION_PERMISSION_LOCATION": undefined;
    "NAVIGATION_MAIN": undefined;
    "NAVIGATION_CHOOSE_COUNTRY_SCREEM": undefined
    "NAVIGATION_DISCONNECTED_NETWORK": undefined
};

function AppNavigation() {
    const theme = useAppSelector(state => state.system.theme)
    const subscriptionIds = useAppSelector(state => state.system.subscriptionIds)
    const fontName = useAppSelector(state => state.system.fontName)

    const dispatch = useAppDispatch()
    const status_application = useAppSelector(state => state.system.config.status_application);

    /**
     * Để đây cho nó Impression
     */

    const {initIAP} = usePurchase(false)

    useEffect(() => {
        setNavBarComponent()

        remoteConfig().setConfigSettings({
            minimumFetchIntervalMillis: 600000,
        }).then(() => {
            dispatch(getSystem())
        });

        if (subscriptionIds.length == 0) {
            try {
                const systemLanguage = languages.getInterfaceLanguage()

                dispatch(setLanguage(systemLanguage.toLowerCase().includes("vi") ? "vi" : "en"))
                dispatch(setSubscriptionIds(SUBSCRIPTIONS))
                initIAP({subscriptionIds: SUBSCRIPTIONS, productIds: [...PRODUCTS,...PRODUCTS_QUESTION]})
            } catch (error) {
                initIAP({subscriptionIds, productIds: [...PRODUCTS,...PRODUCTS_QUESTION]})
            }
        } else {
            initIAP({subscriptionIds, productIds: PRODUCTS})
        }

        getConfigEcosystem()

    }, [])

    useEffect(() => {
        if (status_application === STATUS_APPLICATION.On) {
            GlobalPopupHelper.statusApplicationScreenRef?.current?.hide();
        } else {
            if (status_application === STATUS_APPLICATION.Update) {
                const inAppUpdates = new SpInAppUpdates(false);
                // curVersion is optional if you don't provide it will automatically take from the app using react-native-device-info
                inAppUpdates.checkNeedsUpdate({curVersion: DeviceInfo.getVersion()}).then((result) => {
                    if (result.shouldUpdate) {
                        GlobalPopupHelper.statusApplicationScreenRef?.current?.show();
                    }
                }).catch((error) => {
                    console.log("error checkNeedsUpdate", error);
                });
            } else {
                GlobalPopupHelper.statusApplicationScreenRef?.current?.show();
            }
        }
    }, [status_application]);

    const getConfigEcosystem = useCallback(async () => {
        const credentials = {
            clientId: '1042995885252-k4rtsrqii27ggr2r5qnjgb685s8bqo55.apps.googleusercontent.com',
            appId: '1:1042995885252:android:5f2282084ef4966646c591',
            apiKey: 'AIzaSyCbYt13w3uwYplZTlwUJFfw6HRH79kjBqA',
            databaseURL: 'https://ecosystem-76077-default-rtdb.firebaseio.com/',
            storageBucket: 'ecosystem-76077.appspot.com',
            messagingSenderId: '1042995885252',
            projectId: 'ecosystem-76077',
        };

        const config = {
            name: 'ECOSYSTEM',
        };

        const secondaryApp = await firebase.initializeApp(credentials, config);


        database(secondaryApp)
            .ref('/ecosystem')
            .once('value')
            .then(snapshot => {
                dispatch(setDataEcosystemAdmob(snapshot.val()))
            });

        database(secondaryApp)
            .ref('/config')
            .once('value')
            .then(snapshot => {
                dispatch(setEcosystemConfig(snapshot.val()))
            });

    }, [])

    const setNavBarComponent = () => {
        if (Device.isIos) {
            return;
        }
        if (theme == EnumTheme.Dark) {
            CustomModule.setColor(RootColor.DarkBackground)
        } else {
            CustomModule.setColor(RootColor.LightBackground)
        }
    }

    useEffect(() => {
        setNavBarComponent()
    }, [theme])


    const NativeStack = createStackNavigator<RootStackList>();

    return (
        <NavigationContainer ref={navigationRef}
                             onReady={() => {
                                 RNBootSplash.hide({fade: false});
                             }}
                             onStateChange={async (state: NavigationState | undefined) => {
                                 const previousRouteName = navigationRef.current;
                                 const currentRouteName = navigationHelper.getActiveRouteName(state);

                                 if (previousRouteName !== currentRouteName && !__DEV__) {
                                     try {
                                         await firebase.analytics().logScreenView({
                                             screen_name: currentRouteName,
                                             screen_class: currentRouteName,
                                         })
                                     } catch (error) {
                                         console.log("errrorejhagdjhasgdjhasgd", error);
                                     }
                                 }
                             }}
        >
            <StatusBar barStyle={theme == EnumTheme.Dark ? "light-content" : "dark-content"} translucent={true}
                       backgroundColor={"transparent"}/>
            <ErrorBoundary>
                <NativeStack.Navigator
                    screenOptions={{
                        ...TransitionPresets.SlideFromRightIOS,
                    }}
                >
                    <NativeStack.Screen
                        name={"NAVIGATION_MAIN"}
                        component={MainNavigator}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <NativeStack.Screen
                        name={"NAVIGATION_DISCONNECTED_NETWORK"}
                        component={DisconnectNetworkScreen}
                        options={{
                            headerShown: false,
                            headerTitleStyle: {
                                fontFamily: fontName + "-Medium"
                            }
                        }}
                    />
                </NativeStack.Navigator>
            </ErrorBoundary>
        </NavigationContainer>
    );
}

export default AppNavigation
