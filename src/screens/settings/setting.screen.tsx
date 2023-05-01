import TextBase from 'components/TextBase';
import { WEBSITE_FRONTEND } from 'configs/index';
import { useAppDispatch, useAppSelector } from 'configs/store.config';
import { NAVIGATION_LOGIN_SCREEN, NAVIGATION_SETTINGS_SYSTEM } from 'constants/router.constant';
import navigationHelper from 'helpers/navigation.helper';
import { openURLWebView, useSystem } from 'helpers/system.helper';
import { languages } from 'languages';
import throttle from "lodash.throttle";
import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Row from 'screens/system/component/row.settings.system';
import { getCurrentUser, logout } from 'store/reducer/user.reducer.store';
import { Device } from 'ui/device.ui';
import { HS, MHS, VS } from 'ui/sizes.ui';
import { SystemTheme } from 'ui/theme';
import HeaderSettings from './components/header.settings';

const SettingsScreen = () => {
  const { styles, theme } = useSystem(createStyles)
  const { account, isAuthenticated } = useAppSelector(state => state.user)
  const dispatch = useAppDispatch()

  const onPressSetting = () => {
    navigationHelper.navigate(NAVIGATION_SETTINGS_SYSTEM);
  }

  const onPressTerm = async () => {
    await openURLWebView(`${WEBSITE_FRONTEND}page/terms`)
  }

  const onPressPrivacy = async () => {
    await openURLWebView(`https://lamthien8x.gitbook.io/ai-book/`)
  }
  const onPressAboutUs = async () => {
    await openURLWebView(`${WEBSITE_FRONTEND}page/about-us`)
  }
  const onPressCookies = async () => {
    await openURLWebView(`${WEBSITE_FRONTEND}page/cookies-policy`)
  }

  const onPressLogout = async () => {
    await dispatch(logout({}));
    navigationHelper.replace(NAVIGATION_LOGIN_SCREEN)
  };

  const throttleBack = throttle(onPressLogout, 1000, { 'trailing': false })

  const renderSettings = () => {
    return (
      <View style={styles.styleSettings}>
        <Row title={languages.settingScreen.system} icon="" borderBottom={true} onPress={onPressSetting} />
        {/* <Row title={languages.settingScreen.aboutUs} icon="" borderBottom={false} onPress={onPressAboutUs} /> */}
        {/* <Row title={languages.settingScreen.termOfUse} icon="" borderBottom={false} onPress={onPressTerm} /> */}
        <Row title={languages.settingScreen.privacyPolicy} icon="" borderBottom={false} onPress={onPressPrivacy} />
        {/* <Row title={languages.settingScreen.cookiesPolicy} icon="" borderBottom={false} onPress={onPressCookies} /> */}

        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: VS._10 }}>
          <TextBase title={languages.settingScreen.createdLove} textAlign={"center"} fontWeight={'bold'} />
          <TextBase title={languages.settingScreen.version+`${DeviceInfo.getVersion()}-${DeviceInfo.getBuildNumber()}`} textAlign={"center"} style={[styles.bottom]} />
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => { dispatch(getCurrentUser(account._id || "")) }} />
      }
    >
      {
        isAuthenticated ? (
          <HeaderSettings />
        ) : null
      }
      {renderSettings()}
    </ScrollView>
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    bottom: {
      marginBottom: VS._40,
      marginTop: VS._8
    },
    styleSettings: {
      width: Device.width,
      paddingBottom: Device.isX ? Device.safeAreaInsetX.bottom + VS._32 : VS._32,
    },
    buttonLogout: {
      height: VS._40,
      borderRadius: MHS._24,
      marginVertical: VS._24,
      backgroundColor: theme.btnInactive,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: HS._16,
    },
  })
}

export default SettingsScreen;
