import { useSystem } from 'helpers/system.helper';
import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { SystemTheme } from 'ui/theme';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const KEY_BANNER_ADS_MOB = Platform.select({
  android: "ca-app-pub-9764638132493814/6294530125",
  ios: "ca-app-pub-9764638132493814/1233204310"
}) || ""

interface Props {
  style?: ViewStyle | ViewStyle[]
  type?: BannerAdSize
}

const BannerAdsComponent = ({ style, type = BannerAdSize.FULL_BANNER }: Props) => {
  const { styles } = useSystem(createStyles)
  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : KEY_BANNER_ADS_MOB}
        size={type}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      width: '100%'
    }
  })
}

export default BannerAdsComponent;