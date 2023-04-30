import TextBase from 'components/TextBase';
import { useSystem } from 'helpers/system.helper';
import React from 'react';

import {
  StyleSheet, TextStyle,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import { Device } from 'ui/device.ui';
import { RootColor } from 'ui/theme';

export interface ButtonActionSheetProps {
  title?: string;
  onPress?: () => void;
  checked?: boolean;
  titleCenter?: boolean;
  titleColor?: string;
  iconCheckColor?: string;
  leftIconName?: string;
  leftIconColor?: string;
  renderRight?: () => void;
  testIDButton?: string;
  accessibilityLabelButton?: string;
  testIDTitle?: string;
  accessibilityLabelTitle?: string;
  titleStyle?: TextStyle;
  iconCheckStyle?: ViewStyle;
  iconCheckSize?: number;
  leftIconComponent?: React.ReactNode;
  autoDismiss?: boolean;
}

export default function ButtonHomePage(props: ButtonActionSheetProps) {
  const {
    title,
    onPress,
    checked,
    leftIconName,
    renderRight,
    testIDButton,
    accessibilityLabelButton,
    testIDTitle,
    accessibilityLabelTitle,
    titleCenter = true,
    titleStyle,
    leftIconComponent,
  } = props;
  const { theme } = useSystem()
  const textCenter = (checked == null && !leftIconName && !leftIconComponent && !renderRight) || titleCenter;
  return (
    <TouchableOpacity
      testID={testIDButton}
      accessibilityLabel={accessibilityLabelButton}
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, textCenter && { justifyContent: 'center' }]}
    >
      <>
        <TextBase
          testID={testIDTitle}
          accessibilityLabel={accessibilityLabelTitle}
          numberOfLines={2}
          style={[styles.txtTitle, !textCenter && { flex: 1 }, titleStyle]}
        >
          {title}
        </TextBase>
        {renderRight && renderRight()}
      </>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Device.width - 32 - 160,
    // marginLeft: 80,
    // marginRight: 80,
    minHeight: 34,
    borderRadius: 100,
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
    flexDirection: 'row',
    backgroundColor: RootColor.MainColor
  },
  leftIcon: {
    marginRight: 8,
  },
  txtTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "bold"
  },
  icon: {
    marginLeft: 8,
  },
});
