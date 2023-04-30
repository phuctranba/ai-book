import { Easing } from 'react-native-reanimated';

export const defaultTimingConfig = {
  duration: 250,
  easing: Easing.bezier(0.33, 0.01, 0, 1),
};

export const defaultSpringConfig = {
  stiffness: 1000,
  damping: 500,
  mass: 3,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};