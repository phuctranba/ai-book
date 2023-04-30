import { useSystem } from 'helpers/system.helper';
import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SystemTheme } from 'ui/theme';
import { MHS, HS, VS } from 'ui/sizes.ui';
import TextBase from 'components/TextBase';
import { IconEdit } from 'assets/svgIcons';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface Props {
  title: string
  onChange: Function
  styleTextInput?: any
  value: string
}

const AniPressable = Animated.createAnimatedComponent(Pressable);

const RowEditProfileComponent = ({ title, onChange, value }: Props) => {
  const { styles, theme } = useSystem(createStyles)
  const havePress = onChange != null;
  const background = useSharedValue(0)

  const onPressIn = () => {
    if (havePress) {
      background.value = withTiming(1, { duration: 400 })
    }
  }

  const onPressOut = () => {
    if (havePress) {
      background.value = withTiming(0, { duration: 400 })
    }
  }

  const onPressRow = () => {
    onPressOut()
    onChange?.()
  }

  const style = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(background.value, [0, 1], ["transparent", theme.btnLightSmoke], "RGB")
    }
  })

  return (
    <AniPressable style={[styles.row, style]} onPressIn={onPressIn} onPress={onPressRow} onPressOut={onPressOut}>
      <TextBase title={title} fontSize={16} fontWeight="bold" />
      <View style={styles.content}>
        <TextBase title={value} />
        <IconEdit width={MHS._16} height={MHS._16} color={theme.text} />
      </View>
    </AniPressable>
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    row: {
      paddingHorizontal: HS._16,
      paddingVertical: VS._10
    },
    content: {
      flexDirection: "row",
      marginTop: VS._10,
      justifyContent: "space-between",
      alignItems: "center"
    }
  })
}

export default RowEditProfileComponent;