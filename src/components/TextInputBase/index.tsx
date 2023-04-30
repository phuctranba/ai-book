import { useSystem } from 'helpers/system.helper';
import React, { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { SystemTheme } from 'ui/theme';

interface Props extends TextInputProps {

}

const TextInputBase = ({ style, ...props }: Props, ref) => {
  const { styles } = useSystem(createStyles)

  return (
    <TextInput
      ref={ref}
      style={[styles.textInput, style]}
      {...props}
    />
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    textInput: {
      // fontFamily
    }
  })
}

export default forwardRef(TextInputBase);