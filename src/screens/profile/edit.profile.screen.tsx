import { AxiosResponse } from 'axios';
import ImageLoad from 'components/ImageLoad';
import { useAppDispatch, useAppSelector } from 'configs/store.config';
import { countryCode, DEFAULT_COUNTRY } from 'constants/country.constant';
import { NAVIGATION_EDIT_TEXT_SCREEN } from 'constants/router.constant';
import { PERMISSION } from 'constants/system.constant';
import dayjs from 'dayjs';
import { GlobalPopupHelper } from 'helpers/index';
import navigationHelper from 'helpers/navigation.helper';
import { requestPermission } from 'helpers/permisison.helper';
import { useSystem, validPhoneNumber } from 'helpers/system.helper';
import { languages } from 'languages';
import { parsePhoneNumber } from 'libphonenumber-js';
import { TypedMediaUpload } from 'models/media.model';
import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadMedia } from 'store/reducer/home.reducer.store';
import { updateProfileOptions, updateProfileUser } from 'store/reducer/user.reducer.store';
import { MHS, VS } from 'ui/sizes.ui';
import { SystemTheme } from 'ui/theme';
import RowEditProfileComponent from './components/row.edit.profile';

const EditProfileScreen = () => {
  const { styles, theme } = useSystem(createStyles)
  const account  = useAppSelector(state => state.user.account)
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)

  const onPressChangeAvatar = async () => {
    const permission = await requestPermission(PERMISSION.permissionLibrary);
    if (permission) {
      try {
        const res = await launchImageLibrary({
          mediaType: "photo",
          selectionLimit: 1,
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 0.8,
          includeExtra: true,
        })
        const image = res?.assets?.[0]
        if (image) {
          GlobalPopupHelper.showLoading(false);
          const res = await dispatch(uploadMedia({
            name: image.fileName || image.uri?.split("/")?.reverse()?.[0] || "",
            uri: Platform.OS === "ios" ? image.uri?.replace("file://", "") : image.uri,
            type: image.type,
            path: image.uri,
          })) as { payload: AxiosResponse<TypedMediaUpload> };
          if (res.payload?.data?.[0]?.src) {
            dispatch(updateProfileUser({
              _id: account._id || "",
              user_avatar: res.payload.data[0].callback.media_url,
              user_avatar_thumbnail: res.payload.data[0].callback.media_thumbnail,
            }))
          }
          GlobalPopupHelper.hideLoading();
        }
      } catch (error) {
        GlobalPopupHelper.hideLoading();
        console.log("error", error);
      }
    }
  }

  const saveUserInfoCallback = useCallback(async (options) => {
    navigationHelper.goBack()
    GlobalPopupHelper.showLoading()
    await dispatch(updateProfileUser({
      _id: account._id || "",
      ...options
    }))
    GlobalPopupHelper.hideLoading()
  }, [])

  const saveUserOptionCallback = useCallback(async (options, countryCode?: string) => {
    const keys = Object.keys(options);
    GlobalPopupHelper.showLoading()
    if (keys.includes("user_phone")) {
      try {
        const phoneValue = options.user_phone;
        const isValid = validPhoneNumber(phoneValue, countryCode);
        if (!isValid) {
          GlobalPopupHelper.hideLoading()
          GlobalPopupHelper.alert({
            type: "error",
            message: languages.editProfileScreen.invalidPhone
          })
          return;
        }
        await dispatch(updateProfileOptions({
          user_id: account._id || "",
          ...options
        }))
      } catch (error) {
        GlobalPopupHelper.hideLoading()
      }
      GlobalPopupHelper.hideLoading()
      navigationHelper.goBack()
      return;
    }
    await dispatch(updateProfileOptions({
      user_id: account._id || "",
      ...options
    }))
    navigationHelper.goBack()
    GlobalPopupHelper.hideLoading()
  }, [])

  const updateProfileName = useCallback(() => {
    navigationHelper.navigate(NAVIGATION_EDIT_TEXT_SCREEN, {
      key: "display_name",
      title: languages.editProfileScreen.displayName,
      value: account.display_name || "",
      onDone: saveUserInfoCallback
    });
  }, [account.display_name])

  const updateProfilePhone = useCallback(() => {
    let country = DEFAULT_COUNTRY
    const v = !(account?.user_phone || "").includes("+") ? `+${account?.user_phone}` : (account?.user_phone || "")
    let value = account?.user_phone || ""
    try {
      const parsePhone = parsePhoneNumber(v)
      value = parsePhone.nationalNumber
      country = countryCode.find(i => i.code == parsePhone.country) || DEFAULT_COUNTRY
    } catch (error) {

    }

    navigationHelper.navigate(NAVIGATION_EDIT_TEXT_SCREEN, {
      key: "user_phone",
      title: languages.editProfileScreen.phoneNumber,
      value,
      country,
      onDone: saveUserOptionCallback,
      textInputProps: {
        keyboardType: "phone-pad"
      }
    });
  }, [account?.user_phone])

  const updateProfileBirthday = useCallback(() => {
    setOpen(true)
  }, [])



  return (
    <View style={styles.container}>
      <ImageLoad
        source={{ uri: account.user_avatar_thumbnail || account.user_avatar || "" }}
        width={MHS._120}
        height={MHS._120}
        style={{ borderRadius: MHS._120 }}
        onPress={onPressChangeAvatar}
      />
      <View style={{ width: "100%" }}>
        <RowEditProfileComponent
          title={languages.editProfileScreen.displayName}
          onChange={updateProfileName}
          value={account.display_name || ""}
        />
        <RowEditProfileComponent
          title={languages.editProfileScreen.birthday}
          onChange={updateProfileBirthday}
          value={account.user_birthday || ""}
        />
        <RowEditProfileComponent
          title={languages.editProfileScreen.phoneNumber}
          onChange={updateProfilePhone}
          value={account.user_phone || ""}
        />
      </View>
      <DatePicker
        modal
        open={open}
        date={account.user_birthday ? new Date(account.user_birthday) : new Date()}
        mode="date"
        androidVariant="iosClone"
        maximumDate={new Date()}
        onConfirm={(date) => {
          setOpen(false)
          saveUserOptionCallback({ user_birthday: dayjs(date).format("YYYY-MM-DD") })
        }}
        onCancel={() => {
          setOpen(false)
        }}
      />

    </View>
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingVertical: VS._32,
      alignItems: "center"
    },
  })
}

export default EditProfileScreen;
