import TextBase from 'components/TextBase';
import { useSystem } from 'helpers/system.helper';
import React from 'react';

import {
  StyleSheet, TextStyle,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import { HS, MHS, VS } from 'ui/sizes.ui';

export interface BottomButtonActionSheetProps {
  style?: ViewStyle;
  title?: string;
  titleColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
  titleStyle?: TextStyle;
  onPress?: () => void;
  testIDButton?: string;
  accessibilityLabelButton?: string;
  testIDTitle?: string;
  accessibilityLabelTitle?: string;
}

export default function BottomButton(props: BottomButtonActionSheetProps) {
  const {
    title,
    style,
    titleStyle,
    onPress,
    borderRadius = MHS._12,
    testIDButton,
    accessibilityLabelButton,
    testIDTitle,
    accessibilityLabelTitle,
  } = props;
  const { theme } = useSystem()

  return (
    <TouchableOpacity
      testID={testIDButton}
      accessibilityLabel={accessibilityLabelButton}
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.background, borderRadius }, style]}
    >
      <TextBase
        testID={testIDTitle}
        accessibilityLabel={accessibilityLabelTitle}
        style={[styles.title, titleStyle]}
      >
        {title}
      </TextBase>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: VS._44,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  title: {
    fontSize: HS._18,
    fontWeight: '500',
  },
});