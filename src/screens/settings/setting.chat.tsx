import TextBase from 'components/TextBase';
import { useAppDispatch, useAppSelector } from 'configs/store.config';
import { NAVIGATION_LOGIN_SCREEN, NAVIGATION_PREMIUM_SERVICE_SCREEN } from 'constants/router.constant';
import { HIT_SLOP_EXPAND_10 } from 'constants/system.constant';
import navigationHelper from 'helpers/navigation.helper';
import { useSystem } from 'helpers/system.helper';
import { languages } from 'languages';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import SpeedMessageComponent from 'screens/system/speed.message.component';
import { setFirstInstall, setSuggestQuestion } from 'store/reducer/system.reducer.store';
import { Device } from 'ui/device.ui';
import { HS, MHS, VS } from 'ui/sizes.ui';
import { SystemTheme } from 'ui/theme';

const SettingChatScreen = () => {
  const { styles, theme } = useSystem(createStyles)
  const dispatch = useAppDispatch()
  const { suggestQuestion, isPremium } = useAppSelector(state => state.system)
  const { isAuthenticated } = useAppSelector(state => state.user)

  const onPressSkip = () => {
    // GlobalPopupHelper.alertRef.current?.alert({
    //   title: languages.notification,
    //   message: languages.settingsChat,
    //   actions: [{
    //     text: languages.confirm,
    //     active: true,
    //     onPress: () => {
    //       dispatch(setFirstInstall({ firstSettingChat: true }))
    //       if (!isAuthenticated) {
    //         navigationHelper.navigate(NAVIGATION_LOGIN_SCREEN)
    //       }
    //       if (isPremium) {
    //         navigationHelper.navigate("DrawerNavigator")
    //         return;
    //       }
    //       navigationHelper.navigate(NAVIGATION_PREMIUM_SERVICE_SCREEN)
    //     }
    //   }]
    // })

    dispatch(setFirstInstall({ firstSettingChat: true }))
    if (!isAuthenticated) {
      navigationHelper.navigate(NAVIGATION_LOGIN_SCREEN)
      return;
    }
    if (isPremium) {
      navigationHelper.navigate("DrawerNavigator")
      return;
    }
    navigationHelper.navigate(NAVIGATION_PREMIUM_SERVICE_SCREEN)
  }

  const onChangeSuggest = (value) => {
    dispatch(setSuggestQuestion(value))
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageHeader} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <TextBase title={languages.settingScreen.suggestQuestion} fontSize={16} fontWeight="600" />
        </View>
        <View style={styles.viewImage}>
          <Pressable style={styles.itemImage} onPress={() => onChangeSuggest(false)}>
            <FastImage
              source={require("assets/images/suggest2.png")}
              style={styles.image}
              resizeMode="stretch"
            />
            <View style={styles.box}>
              {
                !suggestQuestion && <View style={styles.selected} />
              }
            </View>
            <TextBase title={languages.notSuggest} fontSize={12} fontWeight="600" />
          </Pressable>
          <Pressable style={styles.itemImage} onPress={() => onChangeSuggest(true)}>
            <FastImage
              source={require("assets/images/suggest.png")}
              style={styles.image}
              resizeMode="stretch"
            />
            <View style={styles.box}>
              {
                suggestQuestion && <View style={styles.selected} />
              }
            </View>
            <TextBase title={languages.suggest} fontSize={12} fontWeight="600" />
          </Pressable>
        </View>
        <SpeedMessageComponent />
      </ScrollView>

      <TextBase style={{ marginHorizontal: HS._12 }} title={languages.settingsChat} fontSize={12} />
      <Pressable style={[styles.buttonGet]} hitSlop={HIT_SLOP_EXPAND_10} onPress={onPressSkip}>
        <TextBase title={languages.confirm} fontWeight="600" fontSize={16} />
      </Pressable>
    </View >
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    buttonGet: {
      borderRadius: MHS._19,
      marginTop: VS._10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.btnActive,
      marginBottom: Device.paddingBottom * 1.2,
      marginHorizontal: HS._16,
      height: VS._44
    },
    imageHeader: {
      width: "100%",
      height: Device.heightPaddingStatusBar
    },
    header: {
      position: "absolute",
      right: HS._16,
      zIndex: 100,
      padding: MHS._6,
      backgroundColor: theme.background,
      borderRadius: MHS._16,
    },
    content: {
      flex: 1,
      width: "100%",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: HS._16,
      paddingVertical: VS._14,
    },
    logo: {
      width: MHS._60,
      height: MHS._60,
      borderRadius: MHS._16,
      alignSelf: "center"
    },
    image: {
      width: "80%",
      height: MHS._170,
      borderRadius: MHS._10
    },
    viewImage: {
      flexDirection: "row",
      gap: HS._16,
      alignItems: "center",
      marginHorizontal: HS._16,
      backgroundColor: `${theme.btnLightSmoke}40`,
      paddingVertical: VS._20,
      borderRadius: MHS._10
    },
    itemImage: {
      flex: 1,
      alignItems: "center"
    },
    box: {
      width: MHS._24,
      height: MHS._24,
      borderRadius: MHS._24,
      borderWidth: 1,
      borderColor: theme.backgroundMain,
      marginVertical: VS._6,
      justifyContent: "center",
      alignItems: "center"
    },
    selected: {
      width: MHS._16,
      height: MHS._16,
      borderRadius: MHS._16,
      backgroundColor: theme.backgroundMain
    }
  })
}

export default SettingChatScreen;
