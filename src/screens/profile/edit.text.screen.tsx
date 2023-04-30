import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { CountryPicker } from 'components/countryModal';
import TextBase from 'components/TextBase';
import { DEFAULT_COUNTRY } from 'constants/country.constant';
import { useSystem } from 'helpers/system.helper';
import { languages } from 'languages';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { FontWeights, HS, MHS, VS } from 'ui/sizes.ui';
import { SystemTheme } from 'ui/theme';

interface RouteParams {
  title: string
  value: string
  key: string
  onDone: (data, key?: string) => void
  textInputProps?: TextInputProps
  country?: any
}

const EditTextScreen = () => {
  const { styles, theme } = useSystem(createStyle)
  const route = useRoute<RouteProp<{ item: RouteParams }>>()
  const { key, title, value, onDone, textInputProps } = route.params;
  const valueRef = useRef("");
  const [showSave, setShowSave] = useState(!!value)
  const navigation = useNavigation()
  const [country, setCountry] = useState(route.params?.country || DEFAULT_COUNTRY)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
      headerRight: renderRight
    })
  }, [showSave])

  const onSave = () => {
    if (key == "user_phone" && valueRef.current?.trim()) {
      onDone?.({ [key]: `${country.dial_code}${valueRef.current.trim()}` }, country.code)
      return;
    }
    if (valueRef.current?.trim()) {
      onDone?.({ [key]: valueRef.current.trim() })
    }
  }

  const renderRight = () => {
    return showSave ? (
      <Pressable style={styles.headerRight} onPress={onSave}>
        <TextBase title={languages.save} fontWeight="600" color={theme.textMain} />
      </Pressable>
    ) : null
  }

  const onChangeCountry = (c) => {
    setCountry(c)
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.viewTextInput}>
          {
            key == "user_phone" ? <CountryPicker
              onSelect={onChangeCountry}
              countryCode={country.code}
              renderFlagButton={({ onOpen }) => (
                <Pressable onPress={onOpen} style={{ marginTop: VS._18 }}>
                  <TextBase fontSize={26} style={[Platform.OS === 'android' ? { marginBottom: 3 } : undefined]}>{`${country.flag} (${country?.dial_code})`}</TextBase>
                </Pressable>
              )}
            /> : null
          }
          <TextInput
            defaultValue={value}
            style={styles.textInput}
            placeholder={title}
            onChangeText={(v) => {
              if (!!v.trim()) {
                setShowSave(true)
              } else {
                setShowSave(false)
              }
              valueRef.current = v
            }}
            placeholderTextColor={theme.textInactive}
            maxLength={50}
            {...textInputProps}
          />
        </View>

      </ScrollView>
    </View>
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
      paddingHorizontal: HS._16
    },
    textInput: {
      backgroundColor: theme.backgroundTextInput,
      height: VS._44,
      paddingHorizontal: HS._16,
      borderRadius: MHS._16,
      marginTop: VS._20,
      ...FontWeights.Bold_400_SVN,
      color: theme.textDark,
      flex: 1
    },
    headerRight: {
      position: "absolute",
      right: HS._16
    },
    viewTextInput: {
      flexDirection: "row",
      alignItems: "center",
      gap: HS._8
    }
  })
}

export default EditTextScreen;
