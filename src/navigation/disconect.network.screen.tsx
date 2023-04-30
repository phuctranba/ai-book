import { useSystem } from 'helpers/system.helper';
import React, { useEffect } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { SystemTheme } from 'ui/theme';
import { MHS, HS, VS } from 'ui/sizes.ui';
import { BackHandler } from 'react-native';
import TextBase from 'components/TextBase';
import { languages } from 'languages';

const DisconnectNetworkScreen = () => {
  const { styles } = useSystem(createStyles)

  useEffect(() => {
    const backAction = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const onPressSettings = async () => {
    await Linking.openSettings()
  }

  return (
    <View style={styles.container}>
      <TextBase title={languages.networkDisconnected} fontWeight="600" fontSize={16} />
      <TextBase title={languages.checkNetwork} style={{ marginTop: VS._10 }} />

      <Pressable style={styles.button} onPress={onPressSettings}>
        <TextBase title={languages.openSettings} fontSize={16} />
      </Pressable>
    </View>
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