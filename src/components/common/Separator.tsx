import React from 'react';

import {
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export interface SeparatorProps {
  type?: 'horizontal' | 'vertical';
  style?: ViewStyle;
  lineWidth?: number;
  backgroundColor?: string;
}

export default function Separator(props: SeparatorProps) {
  const { type = 'horizontal', style, lineWidth = StyleSheet.hairlineWidth, backgroundColor = 'rgba(0, 0, 0, 0.2)' } = props;
  const separatorStyle = {
    [type === 'horizontal' ? 'height' : 'width']: lineWidth,
  };

  return (
    <View style={[{ backgroundColor }, separatorStyle, style]} />
  );
}