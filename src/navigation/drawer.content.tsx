import {DrawerContentScrollView} from '@react-navigation/drawer';
import {useIsFocused} from "@react-navigation/native";
import {IconLock, IconRight} from 'assets/svgIcons';
import TextBase from 'components/TextBase';
import {useAppSelector} from 'configs/store.config';
import {
  NAVIGATION_ECOSYSTEM_SCREEN,
  NAVIGATION_PREMIUM_SERVICE_SCREEN,
  NAVIGATION_SETTING_FONT,
  NAVIGATION_SETTING_FONT_SIZE,
  NAVIGATION_SETTING_SPEED,
  NAVIGATION_SETTINGS_THEME
} from 'constants/router.constant';
import {GlobalPopupHelper} from 'helpers/index';
import navigationHelper from 'helpers/navigation.helper';
import {usePurchase} from 'helpers/purchase.helper';
import {logEventAnalytics, openURLWebView, PRODUCTS, useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import React, {useCallback} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Device} from 'ui/device.ui';
import {FontSizes, HS, MHS, VS} from 'ui/sizes.ui';
import {RootColor, SystemTheme} from 'ui/theme';
import InAppReview from "react-native-in-app-review";
import {STORE_LINK} from "constants/system.constant";
import {EnumAnalyticEvent} from "constants/anlytics.constant";
import {Shadow2} from "ui/shadow.ui";

const Row = ({title, value}) => {
  const {styles, theme} = useSystem(stylesRow)
  const isPremium = useAppSelector(state => state.system.isPremium)

  const eventName = () => {
    switch (value) {
      case "font":
        return "setting_font"
      case "fontSize":
        return "setting_fontSize"
      case "changeTheme":
        return "setting_changeTheme"
      default:
        return "setting_speedText"
    }
  }

  const onPressItem = () => {
    logEventAnalytics(eventName())
    switch (value) {
      case "font":
        logEventAnalytics(EnumAnalyticEvent.SettingFront)
        navigationHelper.navigate(NAVIGATION_SETTING_FONT)
        break;
      case "fontSize":
        logEventAnalytics(EnumAnalyticEvent.SettingFrontSize)
        navigationHelper.navigate(NAVIGATION_SETTING_FONT_SIZE)
        break;
      case "changeTheme":
        logEventAnalytics(EnumAnalyticEvent.SettingTheme)
        navigationHelper.navigate(NAVIGATION_SETTINGS_THEME)
        break;
      default:
        logEventAnalytics(EnumAnalyticEvent.SettingSpeed)
        navigationHelper.navigate(NAVIGATION_SETTING_SPEED)
        break;
    }
  }

  return (
    <Pressable style={styles.row} onPress={onPressItem}>
      <TextBase title={title} fontSize={FontSizes._16}/>
    </Pressable>
  )
}

const stylesRow = (theme: SystemTheme) => {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingHorizontal: HS._16,
      width: "100%",
      paddingVertical: VS._16,
      backgroundColor: `${theme.btnInactive}20`,
      borderBottomColor: theme.btnLightSmoke,
      borderBottomWidth: StyleSheet.hairlineWidth
    }
  })
}

const DrawerContent = ({navigation}) => {
  const {styles, theme} = useSystem(createStyles)
  const isPremium = useAppSelector(state => state.system.isPremium)
  const isFocus = useIsFocused()
  const {buyProduct} = usePurchase(isFocus)

  const goToPremium = () => {
    navigation.replace(NAVIGATION_PREMIUM_SERVICE_SCREEN)
  }

  const onRate = useCallback(() => {
    logEventAnalytics(EnumAnalyticEvent.PressRateApp)
    GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
    if (InAppReview.isAvailable()) {
      InAppReview.RequestInAppReview()
        .then((hasFlowFinishedSuccessfully) => {
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      openURLWebView(STORE_LINK)
    }
  }, [])

  const onPressPrivacy = async () => {
    GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
    await openURLWebView(`https://lamthien8x.gitbook.io/ai-book/`)
  }

  const onPressDonation = () => {
    logEventAnalytics(EnumAnalyticEvent.PressDonate)
    GlobalPopupHelper.actionSheetRef.current?.show({
      title: languages.drawerContent.donationForUs,
      options: [
        {
          title: "1$",
          onPress: () => {
            logEventAnalytics(EnumAnalyticEvent.PressConfirmDonate)
            GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
            buyProduct(PRODUCTS[0])
          },
        },
        {
          title: "5$",
          onPress: () => {
            logEventAnalytics(EnumAnalyticEvent.PressConfirmDonate)
            GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
            buyProduct(PRODUCTS[1])
          },
        },
      ],
      bottomTitle: languages.cancel,
    })
  }

  return (
    <View style={styles.container}>
      <DrawerContentScrollView style={styles.container} contentContainerStyle={{alignItems: "center"}}>
        {isPremium ?
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
              <TextBase title={languages.homeScreen.currentPackage}
                        color={theme.text}
                        fontSize={FontSizes._14}/>
            </View>
            <TextBase title={languages.homeScreen.premium} fontWeight={"900"}
                      style={{marginVertical: VS._16}}
                      color={RootColor.PremiumColor}
                      fontSize={FontSizes._36}/>
          </View>
          :
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
              <TextBase title={languages.homeScreen.currentPackage + ":  "}
                        color={theme.text}
                        fontSize={FontSizes._14}/>
              <TextBase title={languages.homeScreen.free.toUpperCase()} fontWeight={"bold"}
                        color={RootColor.MainColor}
                        fontSize={FontSizes._18}/>
            </View>

            <Pressable style={styles.btnPremium} onPress={goToPremium}>
              <TextBase title={languages.homeScreen.getPremium} fontWeight={"bold"}
                        color={RootColor.WhiteSmoke}
                        fontSize={FontSizes._18}/>
            </Pressable>
            <TextBase title={languages.drawerContent.oneDayPremium}
                      style={{paddingBottom: VS._16, paddingHorizontal: HS._4}}/>
          </View>
        }
        <Row title={languages.drawerContent.font} value={"font"}/>
        <Row title={languages.drawerContent.fontSize} value={"fontSize"}/>
        <Row title={languages.drawerContent.changeTheme} value={"changeTheme"}/>
        <Row title={languages.drawerContent.speedText} value={"speedText"}/>

        {/*<Pressable style={[styles.row, {marginTop: VS._32}, styles.borderBottom]} onPress={onRate}>*/}
        {/*    <TextBase title={languages.navigation.rating} fontSize={FontSizes._16} style={styles.textRow}/>*/}
        {/*    <IconRight size={MHS._14} color={`${theme.text}40`}/>*/}
        {/*</Pressable>*/}
        <Pressable style={[styles.row, {marginTop: VS._32}, styles.borderBottom]} onPress={onPressPrivacy}>
          <TextBase title={languages.navigation.policy} fontSize={FontSizes._16} style={styles.textRow}/>
          <IconRight size={MHS._14} color={`${theme.text}40`}/>
        </Pressable>
        {
          Device.isAndroid ? (
            <Pressable style={[styles.row, styles.borderBottom]}
                       onPress={onPressDonation}>
              <TextBase title={languages.drawerContent.donationForUs} fontSize={FontSizes._16}
                        style={styles.textRow}/>
              <IconRight size={MHS._14} color={`${theme.text}40`}/>
            </Pressable>
          ) : null
        }

        <Pressable style={[styles.btnPremium, {backgroundColor: RootColor.MainColor, marginTop: VS._40}]}
                   onPress={() => navigationHelper.navigate(NAVIGATION_ECOSYSTEM_SCREEN)}>
          <TextBase title={"Ecosystem"} fontWeight={"bold"}
                    color={RootColor.WhiteSmoke}
                    fontSize={FontSizes._16}/>
        </Pressable>
      </DrawerContentScrollView>
    </View>

  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: VS._12
    },
    avatar: {
      borderRadius: MHS._60,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: HS._16,
      paddingVertical: VS._20,
      backgroundColor: `${theme.btnInactive}20`
    },
    btnPremium: {
      alignItems: "center",
      paddingHorizontal: HS._34,
      paddingVertical: VS._16,
      width: "auto",
      backgroundColor: RootColor.PremiumColor,
      marginHorizontal: HS._40,
      borderRadius: MHS._50,
      marginVertical: VS._16,
      ...Shadow2
    },
    textRow: {
      flex: 1
    },
    header: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: HS._16,
      marginBottom: VS._20
    },
    borderBottom: {
      borderBottomColor: theme.btnLightSmoke,
      borderBottomWidth: StyleSheet.hairlineWidth
    }
  })
}

export default DrawerContent;
