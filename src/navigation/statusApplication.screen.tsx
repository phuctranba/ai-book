import TextBase from "components/TextBase";
import { logEventAnalytics, useSystem } from "helpers/system.helper";
import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { Image, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import Modal from "react-native-modal";
import { Device } from "ui/device.ui";
import { Shadow1, Shadow2 } from "ui/shadow.ui";
import { HS, MHS, VS } from "ui/sizes.ui";
import { RootColor, SystemTheme } from "ui/theme";
import { useAppSelector } from "configs/store.config";
import { STATUS_APPLICATION } from "store/reducer/system.reducer.store";
import DeviceInfo from "react-native-device-info";


const StatusApplicationScreen = (_, ref) => {
  const { styles } = useSystem(createStyles);
  const [visible, setVisible] = useState(false);
  const status_application = useAppSelector(state => state.system.config.status_application);


  useImperativeHandle(ref, () => ({
    show: () => {
      setVisible(true);
    },
    hide: () => {
      setVisible(false);
    }
  }));

  const onPressUpdate = useCallback(() => {
    logEventAnalytics("press_update");
    Linking.openURL(Platform.select({
      android: "https://play.google.com/store/apps/details?id="+DeviceInfo.getBundleId(),
      default: "https://play.google.com/store/apps/details?id="+DeviceInfo.getBundleId()
    }));
  }, []);

  return (
    <Modal
      isVisible={visible}
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
        {status_application === STATUS_APPLICATION.Off ?
          <View style={styles.containerAlert}>
            <Image source={require("assets/images/maintain.png")} style={styles.img} resizeMode={"contain"} />
            <TextBase
              title={"Our system is under maintenance to upgrade. Please visit again later. We are very sorry for this inconvenience."}
              style={styles.txt} />
          </View> : null}

        {status_application === STATUS_APPLICATION.Update ?
          <View style={styles.containerAlert}>
            <Image source={require("assets/images/newUpdate.png")} style={styles.img} resizeMode={"contain"} />
            <TextBase
              title={"We have released a new version of the app with important updates and modifications. Please update the app to continue using it."}
              style={styles.txt} />
            <Pressable style={styles.btn} onPress={onPressUpdate}>
              <TextBase title={"Update now"} style={styles.txtBtn} />
            </Pressable>
          </View> : null}
      </View>
    </Modal>
  );
};

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    containerAlert: {
      width: "80%",
      alignItems: "center",
      paddingHorizontal: HS._20,
      paddingVertical: MHS._20,
      borderRadius: MHS._18,
      backgroundColor: RootColor.LightBackground
    },
    img: {
      width: HS._150,
      height: HS._150
    },
    btn: {
      marginTop: VS._28,
      backgroundColor: RootColor.MainColor,
      borderRadius: MHS._16,
      paddingVertical: MHS._16,
      alignItems: "center",
      width: "70%",
      ...Shadow2
    },
    txtBtn: {
      color: RootColor.LightBackground,
      fontSize: 16,
      fontWeight: "bold"
    },
    circleSale: {
      backgroundColor: RootColor.RedNegative,
      width: MHS._120,
      height: MHS._120,
      borderRadius: MHS._120,
      justifyContent: "center",
      alignItems: "center"
    },
    txt: {
      color: RootColor.DarkBackground,
      fontSize: 16,
      textAlign: "center",
      marginTop: VS._12
    },
    content: {
      backgroundColor: theme.background,
      width: "90%",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: HS._10,
      paddingHorizontal: HS._16,
      paddingVertical: VS._10,
      borderRadius: MHS._16,
      ...Shadow1
    },
    buttonClose: {
      padding: MHS._10,
      backgroundColor: theme.background,
      borderRadius: 100,
      marginTop: VS._20
    },
    buttonPremium: {
      backgroundColor: RootColor.PremiumColor,
      paddingVertical: VS._6,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: MHS._10
    },
    basePrice: {
      textDecorationLine: "line-through"
    }
  });
};

export default forwardRef(StatusApplicationScreen);
