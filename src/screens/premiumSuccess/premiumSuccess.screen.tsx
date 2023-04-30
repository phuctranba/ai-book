import TextBase from 'components/TextBase'
import { HIT_SLOP_EXPAND_10 } from 'constants/system.constant'
import navigationHelper from 'helpers/navigation.helper'
import { useSystem } from 'helpers/system.helper'
import { languages } from 'languages'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { withIAPContext } from 'react-native-iap'
import { Device } from 'ui/device.ui'
import { FontSizes, HS, MHS, VS } from 'ui/sizes.ui'
import { RootColor, SystemTheme } from 'ui/theme'
import LottieView from "lottie-react-native";

const PremiumSuccessScreen = () => {
  const { theme, styles } = useSystem(createStyles)

  const onPressGoToHome = () => {
    navigationHelper.replace("DrawerNavigator")
  }

  return (
    <View style={styles.container}>

      <LottieView source={require("assets/lotties/premium.json")}
        autoPlay
        loop={true}
        autoSize={true}
        style={{ height: Device.width / 2, marginRight: HS._20, paddingLeft: 0, paddingRight: 0, transform: [{ scale: 1.5 }], marginBottom: '20%' }} />

      <TextBase title={"PREMIUM"} fontWeight="900" fontSize={FontSizes._40} color={RootColor.PremiumColor} />

      <TextBase title={languages.premiumScreen.premiumSuccessDescription} fontSize={MHS._18} textAlign={"center"}
        style={{ marginTop: VS._48, marginHorizontal: HS._24 }} />

      <Pressable style={[styles.buttonGet, {
        paddingVertical: VS._16,
        marginTop: VS._100,
        backgroundColor: RootColor.PremiumColor,
        flexDirection: 'row'
      }]} hitSlop={HIT_SLOP_EXPAND_10} onPress={onPressGoToHome}>
        <TextBase title={languages.premiumScreen.premiumSuccessTryIt} fontWeight="900" fontSize={FontSizes._20} />
      </Pressable>
    </View>
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background
    },
    flexRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: HS._16,
      paddingVertical: VS._10,
      gap: HS._10
    },
    imageHeader: {
      width: "100%",
      height: VS._100
    },
    gradientHeader: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10
    },
    content: {
      flex: 1,
      marginTop: -VS._28,
      width: "100%"
    },
    header: {
      position: "absolute",
      right: HS._16,
      zIndex: 100,
      padding: MHS._6,
      backgroundColor: theme.background,
      borderRadius: MHS._16,
    },
    packageItem: {
      borderRadius: MHS._16,
      width: Device.width - HS._32 * 2,
      marginTop: VS._10,
      paddingVertical: VS._10,
      paddingHorizontal: HS._16,
      flexDirection: "row",
      alignItems: "flex-end",
      gap: HS._4
    },
    packageSelected: {
      borderColor: theme.text
    },
    packageNotSelected: {
      borderColor: theme.btnInactive
    },
    buttonGet: {
      borderRadius: MHS._10,
      width: "90%",
      marginTop: VS._10,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: VS._10,
      backgroundColor: theme.text
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: HS._16,
      justifyContent: "space-between",
    },
    contentView: {
      backgroundColor: `${theme.backgroundTextInput}20`,
      width: Device.width - HS._32 * 2,
      marginTop: VS._20,
      paddingHorizontal: HS._4,
      borderRadius: MHS._10
    },
    freeTrial: {
      textDecorationLine: "underline"
    },
    viewDes: {
      paddingHorizontal: HS._10,
    },
    policy: {
      textDecorationLine: "underline",
      textAlign: "center",
      marginTop: VS._10,
    },
  })
}

export default withIAPContext(PremiumSuccessScreen)
