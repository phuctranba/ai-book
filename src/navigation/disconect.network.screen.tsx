import { useNetInfo } from "@react-native-community/netinfo";
import TextBase from 'components/TextBase';
import { logEventAnalytics, useSystem } from "helpers/system.helper";
import { languages } from 'languages';
import React, { useEffect, useRef } from "react";
import { BackHandler, Linking, Pressable, StyleSheet, View } from 'react-native';
import Modal from "react-native-modal";
import { Device } from 'ui/device.ui';
import { MHS, VS } from 'ui/sizes.ui';
import { SystemTheme } from 'ui/theme';
import { useAppDispatch, useAppSelector } from "configs/store.config";
import { getSystem, setIsConnectedInternet } from "store/reducer/system.reducer.store";

const DisconnectNetworkScreen = (_, ref) => {
  const { styles } = useSystem(createStyles)
  const netInfo = useNetInfo();
  const chatgpt_key = useAppSelector(state => state.system.config.chatgpt_key);
  const refPreState = useRef<boolean|null>(null);
  const dispatch = useAppDispatch();

  useEffect(()=>{
    if(netInfo.isConnected && refPreState.current === false && !chatgpt_key){
      dispatch(getSystem())
    }

    refPreState.current = netInfo.isConnected;
  },[chatgpt_key, netInfo.isConnected])

  useEffect(() => {
    if(netInfo.isConnected===false){
      logEventAnalytics("disconnected")
    }

    if(netInfo.isConnected!==null){
      dispatch(setIsConnectedInternet(netInfo.isConnected))
    }
    if(netInfo.isConnected === null || netInfo.isConnected === false){
      const backAction = () => {
        return true;
      };

      const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          backAction,
      );

      return () => backHandler.remove();
    }

    return;
  }, [netInfo.isConnected]);

  const onPressSettings = async () => {
    await Linking.openSettings()
  }

  return (
      <Modal
          isVisible={netInfo.isConnected == null ? false : !netInfo.isConnected}
          animationOutTiming={500}
          animationInTiming={0}
          animationIn={"fadeIn"}
          animationOut={"fadeOut"}
          backdropTransitionInTiming={300}
          backdropTransitionOutTiming={0}
          hideModalContentWhileAnimating={false}
          propagateSwipe
          statusBarTranslucent
          deviceHeight={Device.heightScreen}
          style={{ margin: 0, padding: 0 }}
      >
        <View style={styles.container}>
          <TextBase title={languages.networkDisconnected} fontWeight="600" fontSize={16} />
          <TextBase title={languages.checkNetwork} style={{ marginTop: VS._10 }} />

          <Pressable style={styles.button} onPress={onPressSettings}>
            <TextBase title={languages.openSettings} fontSize={16} />
          </Pressable>
        </View>
      </Modal>
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center"
    },
    button: {
      width: "60%",
      backgroundColor: theme.btnActive,
      height: VS._44,
      borderRadius: MHS._10,
      justifyContent: "center",
      alignItems: "center",
      marginTop: VS._20
    }
  })
}

export default DisconnectNetworkScreen;
