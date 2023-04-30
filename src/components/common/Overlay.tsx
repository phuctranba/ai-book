import React from 'react';

import {
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

export interface OverlayProps {
  progress: Animated.SharedValue<number>;
  onPress?: () => void;
  backgroundColor?: string;
  overlayOpacity?: number;
}

export default function Overlay(props: OverlayProps) {
  const { onPress, progress, backgroundColor= 'black', overlayOpacity = 0.4 } = props;

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0, overlayOpacity], Extrapolate.CLAMP),
    };
  });

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: "transparent" }, containerStyle]} />
    </TouchableWithoutFeedback>
  );
}