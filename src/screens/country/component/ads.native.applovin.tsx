import { EnumAnalyticEvent } from 'constants/anlytics.constant';
import { GlobalPopupHelper } from 'helpers/index';
import { logEventAnalytics, useDisplayAds, useSystem } from 'helpers/system.helper';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import AppLovinMAX from "react-native-applovin-max";
import { Device } from 'ui/device.ui';
import { FontSizes, FontWeights, HS, MHS, VS } from 'ui/sizes.ui';
import { SystemTheme } from 'ui/theme';

interface Props {
  onAdClicked: () => void
  onAdLoadFailedProps: () => void
}


const WIDTH = Math.min(Device.width - HS._32, Device.width - 16)

const AdsNativeAppLovin = ({ onAdClicked, onAdLoadFailedProps }: Props, ref) => {
  const { styles, theme } = useSystem(createStyles)
  const { key_native_ads_applovin } = useDisplayAds()
  const currentLoad = useRef(0)

  const nativeAdViewRef = useRef<any>()

  useImperativeHandle(ref, () => ({
    onAdLoadFailed
  }))

  const onAdLoadFailed = () => {
    logEventAnalytics(EnumAnalyticEvent.FailNativeApplovinAds)
    currentLoad.current += 1
    if (currentLoad.current < 2) {
      nativeAdViewRef.current?.loadAd()
      return;
    }
    onAdLoadFailedProps?.()
  }

  return (
    <AppLovinMAX.NativeAdView
      adUnitId={key_native_ads_applovin}
      style={{ width: WIDTH, height: Device.height * .5 }}
      ref={nativeAdViewRef}
      onAdLoaded={(adInfo) => {
        console.log("Native ad loaded from ", adInfo.networkName);
        GlobalPopupHelper.modalLoadingRef.current?.hide()
      }}
      onAdLoadFailed={onAdLoadFailed}
      onAdClicked={onAdClicked}
      onAdRevenuePaid={(adInfo) => {
        console.log('Native ad revenue paid: ' + adInfo.revenue);
      }}
    >
      <View style={{ flexGrow: 1, flexShrink: 1, paddingHorizontal: HS._16, }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: HS._8 }}>
          <AppLovinMAX.NativeAdView.IconView style={{ width: 40, height: 40 }} />
          <View style={{ flex: 1 }}>
            <AppLovinMAX.NativeAdView.TitleView style={{ fontWeight: 'bold', fontSize: 13, color: theme.textDark }} />
            <AppLovinMAX.NativeAdView.AdvertiserView numberOfLines={2} style={{ fontSize: 11, color: theme.textDark }} />
          </View>
        </View>
      </View>
      <AppLovinMAX.NativeAdView.MediaView
        style={{
          width: Device.width, height: Device.height / 3
        }}
      />

      <AppLovinMAX.NativeAdView.CallToActionView
        style={styles.buttonAds}
      />
    </AppLovinMAX.NativeAdView>
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    buttonAds: {
      width: "80%",
      alignSelf: "center",
      borderRadius: MHS._16,
      textAlign: "center",
      paddingVertical: VS._6,
      fontWeight: "700",
      backgroundColor: theme.btnActive,
      color: theme.textLight,
      fontSize: FontSizes._16,
    },
    titleButton: {
      color: theme.textLight,
      fontSize: FontSizes._16,
      ...FontWeights.Bold_600_SVN
    },
    mediaView: {
      width: WIDTH,
      height: VS._100
    }
  })
}

export default forwardRef(AdsNativeAppLovin);