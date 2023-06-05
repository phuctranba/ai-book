import ImageLoad from "components/ImageLoad";
import TextBase from "components/TextBase";
import { useAppSelector } from "configs/store.config";
import { NAVIGATION_EDIT_PROFILE } from "constants/router.constant";
import { HIT_SLOP_EXPAND_20 } from "constants/system.constant";
import navigationHelper from "helpers/navigation.helper";
import {useSystem } from "helpers/system.helper";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Device } from "ui/device.ui";
import { HS, MHS, VS } from "ui/sizes.ui";
import { SystemTheme } from "ui/theme";

const size = MHS._80;
const HEIGHT_HEADER = Device.heightPaddingStatusBar + MHS._100;


const HeaderSettings = () => {
  const { styles, theme } = useSystem(createStyle);
  const account  = useAppSelector(state => state.user.account);

  const goToBuy = () => {
    // navigationHelper.navigate(NAVIGATION_PREMIUM_ACCOUNT)
  }

  const onPressEditProfile = () => {
    navigationHelper.navigate(NAVIGATION_EDIT_PROFILE);
  };

  const renderAvatar = () => {
    return (
      <Pressable style={[styles.viewAvatar]} hitSlop={HIT_SLOP_EXPAND_20} pointerEvents="box-only" onPress={onPressEditProfile}>
        <ImageLoad
          source={{ uri: account?.user_avatar_thumbnail || account?.user_avatar || "" }}
          style={styles.avatar}
          width={size}
          height={size}
          resizeMode="cover"
        />
      </Pressable>
    )
  }

  return (
    <View style={styles.header} >
      <View style={{ flexDirection: "row" }}>
        {renderAvatar()}
        <View style={[styles.footerLeft]}>
          <View style={{ flexDirection: "row", alignItems: "center", }}>
            <TextBase
              fontSize={20}
              fontWeight="600"
              color={theme.text}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ marginRight: HS._8 }}
            >
              {account.display_name || "User"}
            </TextBase>
          </View>
        </View>
      </View>
    </View>
  )
}


const createStyle = (theme: SystemTheme) => {
  return StyleSheet.create({
    header: {
      paddingTop: Device.heightPaddingStatusBar + 8,
      paddingHorizontal: HS._16,
      height: HEIGHT_HEADER,
      paddingBottom: VS._16,
      backgroundColor: theme.background
    },
    avatar: {
      borderRadius: MHS._140,
      alignSelf: "center",
    },
    footerLeft: {
      marginLeft: HS._16,
      justifyContent: "center",
    },
    iconPremium: {
      height: 26,
      paddingHorizontal: 12,
      lineHeight: 30,
      marginTop: 2,
      textAlign: "center",
      alignItems: "center",
      borderRadius: 10,
      alignSelf: "baseline"
    },
    freeUser: {
      backgroundColor: "#e0e0e0",
    },
    premiumUser: {
      backgroundColor: "#ffbe0b",
    },
    viewAvatar: {
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "center",
    },
  });
};

export default HeaderSettings
