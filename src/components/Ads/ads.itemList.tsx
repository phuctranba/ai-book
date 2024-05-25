import React, {memo, useMemo, useRef} from "react";

import TextBase from "components/TextBase";
import {useAppSelector} from "configs/store.config";
import {EnumAnalyticEvent} from "constants/anlytics.constant";
import {EnumTheme, randomAppAds} from "constants/system.constant";
import {GlobalPopupHelper} from "helpers/index";
import {logEventAnalytics, useSystem} from "helpers/system.helper";
import {Linking, Pressable, View} from "react-native";
import FastImage from "react-native-fast-image";
import {MHS, MVS} from "ui/sizes.ui";

function AdsItemList() {
  const {theme} = useSystem();
  const themeText = useAppSelector(state => state.system.theme);
  const isPremium = useAppSelector(state => state.system.isPremium);
  const refDataAdsEcosystem = useRef(randomAppAds());


  if (isPremium) {
    return null;
  }


  return (
    <Pressable
      onPress={() => {
        logEventAnalytics(EnumAnalyticEvent.EcosystemAdsClick + "_" + refDataAdsEcosystem.current.name);
        GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
        Linking.openURL(refDataAdsEcosystem.current.link);
      }}
      style={{
        marginTop:MHS._12,
        paddingHorizontal: MHS._16,
        paddingVertical: MHS._5,
        flexDirection: "row",
        backgroundColor: `${theme.btnInactive}20`,
        borderRadius: MHS._10,
        alignItems: "center"
      }}>
      <FastImage
        source={typeof refDataAdsEcosystem.current.logo === 'number' ? refDataAdsEcosystem.current.logo : {uri: refDataAdsEcosystem.current.logo}}
        style={{
          width: MVS._60, height: MVS._60, borderRadius: MHS._5
        }}
        resizeMode={"contain"}
      />
      <View style={{flex: 1, alignItems: "flex-start", justifyContent: "space-around", paddingHorizontal: MHS._5}}>
        <TextBase title={refDataAdsEcosystem.current.title} numberOfLines={2} style={{
          fontSize: 14,
          fontWeight: "700",
          color: themeText == EnumTheme.Dark ? "#F3F3F3" : "#474747"
        }}/>
        <TextBase title={refDataAdsEcosystem.current.description} numberOfLines={2}
                  style={{fontSize: 12, color: themeText == EnumTheme.Dark ? "#F3F3F3" : "#474747"}}/>
      </View>
      <View
        style={{
          width: MHS._70,
          paddingVertical: MHS._12,
          paddingHorizontal: MHS._16,
          backgroundColor: "#006484",
          justifyContent: "center",
          alignItems: "center",
          elevation: 10,
          borderRadius: MHS._5
        }}

      >
        <TextBase title={"Install"} numberOfLines={2} style={{fontSize: 12, color: theme.textLight}}
                  fontWeight={"bold"}/>
      </View>
    </Pressable>
  );
}

export default memo(AdsItemList)
