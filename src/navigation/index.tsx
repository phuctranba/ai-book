import React, {useEffect, useRef} from "react";

import NetInfo from "@react-native-community/netinfo";
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
import {getSystem, setLanguage, setSubscriptionIds} from "store/reducer/system.reducer.store";
import {Device} from "ui/device.ui";
import {RootColor} from "ui/theme";
import DisconnectNetworkScreen from "./disconect.network.screen";
import MainNavigator from "./main.navigation";
import remoteConfig from "@react-native-firebase/remote-config";
import {usePurchase} from "helpers/purchase.helper";
import {PRODUCTS, SUBSCRIPTIONS} from "helpers/system.helper";

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
    const dispatch = useAppDispatch()
    const refIsConnectionInternet = useRef<boolean>(true);
    const fontName = useAppSelector(state => state.system.fontName)

    /**
     * Để đây cho nó Impression
     */
    const stateToImpression = useAppSelector(state => state.system.stateToImpression)

    const {initIAP} = usePurchase(false)

    useEffect(() => {
        setNavBarComponent()

        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (state.isConnected !== refIsConnectionInternet.current) {
                refIsConnectionInternet.current = state.isConnected || false;
                if (state.isConnected) {
                    navigationHelper.replace("NAVIGATION_MAIN",{shouldGoToTrueScreenAfterReConnect: true})
                } else {
                    navigationHelper.replace("NAVIGATION_DISCONNECTED_NETWORK")
                }
            }
        });

        remoteConfig().setConfigSettings({
            minimumFetchIntervalMillis: 600000,
        }).then(()=>{
            dispatch(getSystem())
        });

        if (subscriptionIds.length == 0) {
            try {
                const systemLanguage = languages.getInterfaceLanguage()

                dispatch(setLanguage(systemLanguage.toLowerCase().includes("vi") ? "vi" : "en"))
                dispatch(setSubscriptionIds(SUBSCRIPTIONS))
                initIAP({subscriptionIds: SUBSCRIPTIONS, productIds: PRODUCTS})
            } catch (error) {
                initIAP({subscriptionIds: SUBSCRIPTIONS, productIds: PRODUCTS})
            }
        } else {
            initIAP({subscriptionIds, productIds: PRODUCTS})
        }

        return (() => {
            unsubscribeNetInfo();
        })
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
                                 RNBootSplash.hide({fade: false})
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
                            headerTitleStyle:{
                                fontFamily:fontName+"-Medium"
                            }
                        }}
                    />
                </NativeStack.Navigator>
            </ErrorBoundary>
        </NavigationContainer>
    );
}

export default AppNavigation
