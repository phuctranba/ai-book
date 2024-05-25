import {Platform, StyleSheet} from 'react-native';
import {SystemTheme} from 'ui/theme';


const BannerAdsComponent = () => {
  // const { styles } = useSystem(createStyles)
  // return (
  //   <View style={[styles.container, style]}>
  //     <BannerAd
  //       unitId={__DEV__ ? TestIds.BANNER : KEY_BANNER_ADS_MOB}
  //       size={type}
  //       requestOptions={{
  //         requestNonPersonalizedAdsOnly: true,
  //       }}
  //     />
  //   </View>
  // )
  return null
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      width: '100%'
    }
  })
}

export default BannerAdsComponent;
