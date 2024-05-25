import TextBase from 'components/TextBase';
import {EnumAnalyticEvent} from 'constants/anlytics.constant';
import {GlobalPopupHelper} from 'helpers/index';
import {logEventAnalytics, useSystem} from 'helpers/system.helper';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {Linking, Pressable, StyleSheet, View} from 'react-native';

import FastImage from 'react-native-fast-image';
import {Device} from 'ui/device.ui';
import {FontSizes, FontWeights, HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import {randomAppAds} from "constants/system.constant";

interface Props {
  onAdClicked: () => void
  onAdLoadFailedProps: () => void
}

const WIDTH = Math.min(Device.width - HS._32, Device.width - 16)

const AdsNativeCountry = ({onAdClicked, onAdLoadFailedProps}: Props, ref) => {
  const {styles, theme} = useSystem(createStyles)

  const refDataAdsEcosystem = useRef(randomAppAds())


  useImperativeHandle(ref, () => ({
    onAdLoadFailed: () => {
    }
  }))


  return (
    <Pressable
      onPress={() => {
        logEventAnalytics(EnumAnalyticEvent.EcosystemAdsClick + "_" + refDataAdsEcosystem.current.name)
        GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
        Linking.openURL(refDataAdsEcosystem.current.link)
      }}
    >
      <View style={{flexDirection: 'row', marginVertical: VS._8, width: '100%'}}>
        <FastImage
          source={refDataAdsEcosystem.current.logo}
          style={{
            width: 40,
            height: 40,
          }}
          resizeMode={'contain'}
        />
        <View style={{flex: 1, marginHorizontal: HS._8, justifyContent: 'space-around'}}>
          <TextBase title={refDataAdsEcosystem.current.title}
                    style={{fontWeight: 'bold', fontSize: 13, color: theme.text}}/>
          <TextBase title={refDataAdsEcosystem.current.description} numberOfLines={2}
                    style={{fontSize: 11, color: theme.text}}/>
        </View>
      </View>

      <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
        <FastImage
          source={refDataAdsEcosystem.current.image[0]}
          style={{
            width: "32.5%",
            height: Device.height / 3,
          }}
          resizeMode={'cover'}
        />
        <FastImage
          source={refDataAdsEcosystem.current.image[1]}
          style={{
            width: "32.5%",
            height: Device.height / 3,
          }}
          resizeMode={'cover'}
        />
        <FastImage
          source={refDataAdsEcosystem.current.image[2]}
          style={{
            width: "32.5%",
            height: Device.height / 3,
          }}
          resizeMode={'cover'}
        />
      </View>

      <View
        style={{...styles.buttonAds, backgroundColor: theme.btnActive, alignSelf: "center", marginTop: VS._6}}
      >
        <TextBase title={"Confirm"} numberOfLines={2}
                  style={{fontSize: FontSizes._16, color: theme.textLight}} fontWeight={'bold'}/>
      </View>
    </Pressable>
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
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: MHS._16
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

export default forwardRef(AdsNativeCountry);
