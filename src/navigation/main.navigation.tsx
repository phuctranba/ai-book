import React, {useEffect} from 'react';

import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {
    NAVIGATION_BLANK,
    NAVIGATION_CHOOSE_COUNTRY_SCREEM,
    NAVIGATION_DELETE_ACCOUNT,
    NAVIGATION_EDIT_PROFILE,
    NAVIGATION_HISTORY,
    NAVIGATION_SUMMARY_SCREEN,
    NAVIGATION_SETTINGS_SCREEN,
    NAVIGATION_SETTINGS_SYSTEM,
    NAVIGATION_UPDATE_VOICE,
    NAVIGATION_SETTING_FONT_SIZE,
    NAVIGATION_SETTING_SPEED,
    NAVIGATION_SETTING_FONT,
    NAVIGATION_SETTINGS_THEME,
    NAVIGATION_PREMIUM_SERVICE_SCREEN,
    NAVIGATION_PREMIUM_SUCCESS_SCREEN,
    NAVIGATION_WELCOME,
    NAVIGATION_ECOSYSTEM_SCREEN
} from 'constants/router.constant';
import {useDisplayAds, useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import {StyleSheet, View} from "react-native";
import ChooseCountry from "screens/country/choose.country.screen";
import SummaryScreen from 'screens/summary/summary.screen';
import EditProfileScreen from 'screens/profile/edit.profile.screen';
import SettingsScreen from 'screens/settings/setting.screen';
import DeleteAccount from 'screens/system/delete.account.screen';
import SettingsSystemScreen from 'screens/system/settings.system.screen';
import UpdateVoiceLanguageScreen from "screens/system/updateVoiceLanguage.screen";
import {Device} from 'ui/device.ui';
import DrawerContent from './drawer.content';
import HistoryScreen from 'screens/history/history.screen';
import {RouteProp, useRoute} from "@react-navigation/native";
import dayjs from "dayjs";
import {GlobalPopupHelper} from "helpers/index";
import {useAppSelector} from "configs/store.config";
import SettingsFontSizeScreen from "screens/settingFontSize/settingsFontSize.screen";
import SettingsSpeedScreen from "screens/settingSpeed/settingsSpeed.screen";
import SettingsFontScreen from "screens/settingFont/settingsFont.screen";
import SettingsThemeScreen from "screens/settingTheme/settingsTheme.screen";
import PremiumServiceScreen from "screens/premium/premium.service.screen";
import PremiumSuccessScreen from "screens/premiumSuccess/premiumSuccess.screen";
import navigationHelper from "helpers/navigation.helper";
import WelcomeScreen from "screens/welcome/welcome.screen";
import EcosystemScreen from "screens/ecosystem/ecosystem.screen";


const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    const {theme} = useSystem()

    return (
        <Drawer.Navigator
            initialRouteName="StackNavigator"
            screenOptions={{
                swipeEnabled: false,
                drawerStyle: {
                    width: Device.width / 4 * 3,
                    backgroundColor: "#EFEFEF",
                },
                overlayColor: "#rgba(0,0,0,0.7)",
                drawerPosition: "left",
                drawerType: "front",
                drawerStatusBarAnimation: "fade",
                unmountOnBlur: true,
                headerStyle: {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.btnLightSmoke,
                    backgroundColor: theme.background
                },
                headerTitleAlign: "center",
                headerTintColor: theme.text,
                headerLeftLabelVisible: false,
            }}
            drawerContent={(props: any) => (
                <DrawerContent {...props} />
            )}
        >
            <Drawer.Screen
                name={NAVIGATION_HISTORY}
                component={HistoryScreen}
                options={() => ({
                    headerShown: false
                })}
            />
        </Drawer.Navigator>
    )
}

const MainStack = createStackNavigator()

const BlackScreen = () => <View/>

const MainNavigator = () => {
    const {theme} = useSystem()
    const route = useRoute<RouteProp<{ item: { shouldGoToTrueScreenAfterReConnect: boolean } }>>()
    const shouldGoToTrueScreenAfterReConnect = route.params?.shouldGoToTrueScreenAfterReConnect
    const {native_ads_country} = useDisplayAds()
    const lastChoiceCountry = useAppSelector(state => state.system.lastChoiceCountry)
    const fontName = useAppSelector(state => state.system.fontName)
    const isPremium = useAppSelector(state => state.system.isPremium)
    const shouldShowWelcome = useAppSelector(state => state.system.shouldShowWelcome);

    useEffect(() => {
        if (shouldGoToTrueScreenAfterReConnect) {
            navigate();
        }
    }, [])

    const navigate = () => {
        console.log("navigate =======================");

        if(isPremium){
            navigationHelper.replace("DrawerNavigator")
            return;
        }

        if (native_ads_country && (lastChoiceCountry === undefined || dayjs().diff(dayjs(lastChoiceCountry), "minutes") > 4320)) {
            GlobalPopupHelper.admobGlobalRef.current?.showOpenAds(NAVIGATION_CHOOSE_COUNTRY_SCREEM)
            return;
        }

        GlobalPopupHelper.admobGlobalRef.current?.showOpenAds(NAVIGATION_PREMIUM_SERVICE_SCREEN)
    }

    return (
        <MainStack.Navigator
            initialRouteName={isPremium ? "DrawerNavigator" : ((native_ads_country && (lastChoiceCountry === undefined || dayjs().diff(dayjs(lastChoiceCountry), "minutes") > 4320)) ? NAVIGATION_CHOOSE_COUNTRY_SCREEM : (shouldShowWelcome ? NAVIGATION_WELCOME : NAVIGATION_PREMIUM_SERVICE_SCREEN))}
            screenOptions={{
                headerStyle: {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.btnLightSmoke,
                    backgroundColor: theme.background,
                },
                headerTitleStyle:{
                    fontFamily:fontName+"-Medium"
                },
                headerTitleAlign: "center",
                headerTintColor: theme.text,
                headerLeftLabelVisible: false,
                gestureEnabled: false,
                ...TransitionPresets.SlideFromRightIOS
            }}
        >
            <MainStack.Screen name={NAVIGATION_BLANK} component={BlackScreen} options={{headerShown: false}}/>
            <MainStack.Screen name={NAVIGATION_SUMMARY_SCREEN} component={SummaryScreen}/>
            <MainStack.Screen
                name={"DrawerNavigator"}
                component={DrawerNavigator}
                options={() => ({
                    headerShown: false,
                })}
            />
            <MainStack.Screen
                name={NAVIGATION_ECOSYSTEM_SCREEN}
                component={EcosystemScreen}
                options={() => ({
                    // headerShown: false,
                })}
            />
            <MainStack.Screen
                name={NAVIGATION_PREMIUM_SERVICE_SCREEN}
                component={PremiumServiceScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <MainStack.Screen
                name={NAVIGATION_PREMIUM_SUCCESS_SCREEN}
                component={PremiumSuccessScreen}
                options={() => ({
                    headerShown: false,
                })}
            />
            <MainStack.Screen
                name={NAVIGATION_CHOOSE_COUNTRY_SCREEM}
                component={ChooseCountry}
                options={{
                    headerTitle: "Choose Country"
                }}
            />
            <MainStack.Screen
                name={NAVIGATION_WELCOME}
                component={WelcomeScreen}
                options={{
                    headerShown: false
                }}
            />
            <MainStack.Screen
                name={NAVIGATION_EDIT_PROFILE}
                component={EditProfileScreen}
                options={() => ({
                    headerTitle: languages.navigation.editProfile,
                })}
            />
            <MainStack.Screen
                name={NAVIGATION_SETTING_FONT_SIZE}
                component={SettingsFontSizeScreen}
                options={() => ({
                    headerTitle: languages.drawerContent.fontSize,
                })}
            />
            <MainStack.Screen
                name={NAVIGATION_SETTING_SPEED}
                component={SettingsSpeedScreen}
                options={() => ({
                    headerTitle: languages.drawerContent.speedText,
                })}
            />
            <MainStack.Screen
                name={NAVIGATION_SETTING_FONT}
                component={SettingsFontScreen}
                options={() => ({
                    headerTitle: languages.drawerContent.font,
                })}
            />
            <MainStack.Screen
                name={NAVIGATION_SETTINGS_SCREEN}
                component={SettingsScreen}
                options={() => ({
                    headerTitle: languages.navigation.settings,
                })}
            />
            <MainStack.Screen
                name={NAVIGATION_SETTINGS_THEME}
                component={SettingsThemeScreen}
                options={() => ({
                    headerTitle: languages.drawerContent.changeTheme,
                })}
            />
            <MainStack.Screen
                name={NAVIGATION_DELETE_ACCOUNT}
                component={DeleteAccount}
                options={{
                    headerTitle: languages.navigation.deleteMyAccount
                }}
            />
            <MainStack.Screen
                name={NAVIGATION_SETTINGS_SYSTEM}
                component={SettingsSystemScreen}
                options={{
                    headerTitle: languages.navigation.settingSystem
                }}
            />
            <MainStack.Screen
                name={NAVIGATION_UPDATE_VOICE}
                component={UpdateVoiceLanguageScreen}
                options={{
                    headerTitle: languages.navigation.updateVoice
                }}
            />
        </MainStack.Navigator>
    )
}

export default MainNavigator;
