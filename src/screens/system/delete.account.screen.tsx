import TextBase from 'components/TextBase';
import { useAppDispatch, useAppSelector } from 'configs/store.config';
import { GlobalPopupHelper } from 'helpers/index';
import navigationHelper from 'helpers/navigation.helper';
import { useSystem } from 'helpers/system.helper';
import { languages } from 'languages';
import { TypedUser } from 'models/user.model';
import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { logout, removeUser } from 'store/reducer/user.reducer.store';
import { HS, MHS, VS } from 'ui/sizes.ui';
import { SystemTheme } from 'ui/theme';

const DeleteAccount = () => {
  const { styles, theme } = useSystem(createStyle)
  const textInputRef = useRef("")
  const account  = useAppSelector(state => state.user.account)
  const dispatch = useAppDispatch()

  const onPressDelete = () => {
    if (!textInputRef.current?.trim()) {
      return;
    }

    GlobalPopupHelper.alertRef.current?.alert({
      title: languages.settingScreen.deleteAccount,
      message: languages.settingScreen.deleteAccountConfirm,
      actions: [{
        text: languages.cancel
      }, {
        text: languages.confirm,
        onPress: onConfirmDelete
      }]
    })
  }

  const onConfirmDelete = async () => {
    try {
      GlobalPopupHelper.showLoading();
      const res: any = await dispatch(removeUser({ id: account?._id || "" }))
      console.log("res", res);

      GlobalPopupHelper.hideLoading();
      if (res.payload && res.payload?._id) {
        dispatch(logout({ callApi: false }))
        navigationHelper.replace("DrawerNavigator")
      } else {
        GlobalPopupHelper.alert({
          type: "error",
          message: languages.somethingWentWrong
        })
      }
    } catch (error) {

    }
  }

  return (
    <ScrollView style={styles.scrollView}>
      <TextBase title={languages.settingScreen.deleteAccountDes} fontSize={16} />
      <TextInput
        multiline
        textAlignVertical="top"
        style={styles.otherReason}
        placeholder={languages.settingScreen.enterReason}
        placeholderTextColor={theme.textInactive}
        onChangeText={v => textInputRef.current = v}
      />
      <Pressable style={styles.btnDel} onPress={onPressDelete}>
        <TextBase title={languages.settingScreen.deleteAccount} style={styles.styleTxtDel} color={theme.textLight} fontWeight="500" />
      </Pressable>
    </ScrollView>
  )
}

const createStyle = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: HS._16,
      paddingVertical: VS._20,
      backgroundColor: theme.background
    },
    viewIcon: {
      width: MHS._24,
      height: MHS._24,
      borderRadius: MHS._24,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: `${theme.btnInactive}30`,
      borderWidth: 0.5,
      marginRight: HS._10
    },
    iconActive: {
      borderColor: theme.btnInactive,
    },
    iconInactive: {
      borderColor: theme.backgroundMain,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: VS._10,
      paddingVertical: VS._4
    },
    otherReason: {
      height: VS._100,
      padding: HS._16,
      backgroundColor: theme.backgroundTextInput,
      marginTop: VS._10,
      borderRadius: MHS._10,
      fontSize: HS._16,
    },
    styleTxtDel: {
      fontWeight: "600",
      fontSize: HS._16,
    },
    btnDel: {
      marginHorizontal: 0,
      backgroundColor: theme.backgroundMain,
      height: VS._44,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: MHS._50,
      marginTop: VS._20
    }
  })
}

export default DeleteAccount;
