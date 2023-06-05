import TextBase from 'components/TextBase';
import { useAppDispatch, useAppSelector } from 'configs/store.config';
import { NAVIGATION_DELETE_ACCOUNT, NAVIGATION_UPDATE_VOICE } from 'constants/router.constant';
import navigationHelper from 'helpers/navigation.helper';
import { useSystem } from 'helpers/system.helper';
import { languages } from 'languages';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from "react-native-fast-image";
import { setSuggestQuestion, switchEnableSpeech } from 'store/reducer/system.reducer.store';
import { Device } from "ui/device.ui";
import { HS, MHS, VS } from 'ui/sizes.ui';
import { SystemTheme } from 'ui/theme';
import Row from './component/row.settings.system';
import SpeedMessageComponent from './speed.message.component';
import Switch from 'components/Switch';

const SettingsSystemScreen = () => {
  const { styles } = useSystem(createStyles);
  const enableSpeech = useAppSelector(state => state.system.enableSpeech)
  const suggestQuestion = useAppSelector(state => state.system.suggestQuestion)
  const isAuthenticated  = useAppSelector(state => state.user.isAuthenticated)
  const dispatch = useAppDispatch()

  const onPressDeleteAccount = () => {
    navigationHelper.navigate(NAVIGATION_DELETE_ACCOUNT)
  }

  const onPressUpdateVoice = () => {
    navigationHelper.navigate(NAVIGATION_UPDATE_VOICE)
  }

  const onChangeSuggest = (value) => {
    dispatch(setSuggestQuestion(value))
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.row}>
        <TextBase title={languages.settingScreen.suggestQuestion} fontSize={16} fontWeight="600" />
      </View>
      <View style={styles.viewImage}>
        <Pressable style={styles.itemImage} onPress={() => onChangeSuggest(false)}>
          <FastImage
              source={require("assets/images/suggest2.png")}
              style={styles.image}
              resizeMode="stretch"
          />
          <View style={styles.box}>
            {
                !suggestQuestion && <View style={styles.selected} />
            }
          </View>
          <TextBase title={languages.notSuggest} fontSize={12} fontWeight="600" />
        </Pressable>
        <Pressable style={styles.itemImage} onPress={() => onChangeSuggest(true)}>
          <FastImage
              source={require("assets/images/suggest.png")}
              style={styles.image}
              resizeMode="stretch"
          />
          <View style={styles.box}>
            {
                suggestQuestion && <View style={styles.selected} />
            }
          </View>
          <TextBase title={languages.suggest} fontSize={12} fontWeight="600" />
        </Pressable>
      </View>
      <SpeedMessageComponent />

      {/*<View style={styles.rowContainer}>*/}
      {/*  <TextBase title={languages.accent} style={styles.title} fontSize={16} fontWeight={"400"}/>*/}
      {/*  <View style={{flexDirection:'row', borderRadius:MHS._4, overflow: "hidden"}}>*/}
      {/*      <TouchableOpacity*/}
      {/*          onPress={()=>dispatch(setGenderVoice("Male"))}*/}
      {/*          style={{backgroundColor:genderVoice==="Male"?RootColor.MainColor:RootColor.Transparent, width:HS._72, alignItems:'center', paddingVertical:MHS._4}}>*/}
      {/*        <TextBase title={languages.male} style={styles.title} fontSize={14} fontWeight={"400"}/>*/}
      {/*      </TouchableOpacity>*/}
      {/*    <TouchableOpacity*/}
      {/*        onPress={()=>dispatch(setGenderVoice("Female"))}*/}
      {/*        style={{backgroundColor:genderVoice==="Female"?RootColor.MainColor:RootColor.Transparent, width:HS._72, alignItems:'center', paddingVertical:MHS._4}}>*/}
      {/*      <TextBase title={languages.female} style={styles.title} fontSize={14} fontWeight={"400"}/>*/}
      {/*    </TouchableOpacity>*/}
      {/*  </View>*/}
      {/*</View>*/}
      <View style={styles.containerItem}>
        <TextBase title={languages.settingScreen.enableSpeech} style={styles.title} fontSize={16} fontWeight={"400"}/>
        <Switch
            value={enableSpeech}
            onChange={()=>dispatch(switchEnableSpeech())}
        />
      </View>
      <Row title={languages.settingScreen.updateVoiceLanguage} icon="" onPress={onPressUpdateVoice} />
      {
        isAuthenticated ? (
          <Row title={languages.settingScreen.deleteAccount} icon="" onPress={onPressDeleteAccount} />
        ) : null
      }
    </ScrollView>
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    containerItem: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.btnLightSmoke,
      flexDirection: "row",
      marginHorizontal: HS._16,
      alignItems: "center",
      paddingVertical: VS._14
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: HS._16,
      paddingVertical: VS._14,
    },
    rowContainer: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.btnLightSmoke,
      flexDirection: "row",
      marginHorizontal: HS._16,
      alignItems: "center",
      paddingVertical: VS._14
    },
    buttonGet: {
      borderRadius: MHS._19,
      marginTop: VS._10,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.btnActive,
      marginBottom: Device.paddingBottom * 1.2,
      marginHorizontal: HS._16,
      height: VS._44
    },
    title: {
      paddingRight: HS._8,
      flex: 1
    },
    imageHeader: {
      width: "100%",
      height: Device.heightPaddingStatusBar
    },
    header: {
      position: "absolute",
      right: HS._16,
      zIndex: 100,
      padding: MHS._6,
      backgroundColor: theme.background,
      borderRadius: MHS._16,
    },
    content: {
      flex: 1,
      width: "100%",
    },
    logo: {
      width: MHS._60,
      height: MHS._60,
      borderRadius: MHS._16,
      alignSelf: "center"
    },
    image: {
      width: "80%",
      height: MHS._170,
      borderRadius: MHS._10
    },
    viewImage: {
      flexDirection: "row",
      gap: HS._16,
      alignItems: "center",
      marginHorizontal: HS._16,
      backgroundColor: `${theme.btnLightSmoke}40`,
      paddingVertical: VS._20,
      borderRadius: MHS._10
    },
    itemImage: {
      flex: 1,
      alignItems: "center"
    },
    box: {
      width: MHS._24,
      height: MHS._24,
      borderRadius: MHS._24,
      borderWidth: 1,
      borderColor: theme.backgroundMain,
      marginVertical: VS._6,
      justifyContent: "center",
      alignItems: "center"
    },
    selected: {
      width: MHS._16,
      height: MHS._16,
      borderRadius: MHS._16,
      backgroundColor: theme.backgroundMain
    }
  })
}

export default SettingsSystemScreen;
