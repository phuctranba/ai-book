import TextBase from 'components/TextBase';
import React from 'react';

import {
  StyleSheet, TextProps,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import { HS, VS } from 'ui/sizes.ui';

export interface HeaderActionSheetProps {
  title?: string;
  titleColor?: string;
  titleStyle?: TextStyle;
  messageColor?: string;
  messageStyle?: TextStyle;
  message?: string;
  style?: ViewStyle;
  titleProps?: TextProps;
  messageProps?: TextProps;
}

export default function Header(props: HeaderActionSheetProps) {
  const { title, message, style, titleStyle, messageStyle, titleProps, messageProps } = props;
  return (
    <View style={[styles.container, style]}>
      {
        title !== undefined && <TextBase numberOfLines={1} {...titleProps} style={[styles.txtTitle, titleStyle]}>{title}</TextBase>
      }
      {
        message !== undefined && <TextBase numberOfLines={1} {...messageProps} style={[styles.txtMessage, messageStyle]}>{message}</TextBase>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: HS._16,
    paddingVertical: VS._8,
    minHeight: VS._56,
    maxHeight: VS._64,
    justifyContent: 'center',
  },
  txtTitle: {
    textAlign: 'center',
    fontSize: HS._14,
    fontWeight: '500',
  },
  txtMessage: {
    textAlign: 'center',
    marginTop: VS._2,
    fontSize: HS._12,
  },
});