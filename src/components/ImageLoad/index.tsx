import { HIT_SLOP_EXPAND_20 } from 'constants/system.constant';
import React from 'react';

import {
  Pressable,
  StyleSheet
} from 'react-native';
import { Blurhash } from "react-native-blurhash";
import FastImage, { FastImageProps } from 'react-native-fast-image';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue, withTiming
} from 'react-native-reanimated';
import { Shadow3 } from 'ui/shadow.ui';

interface Props extends FastImageProps {
  width?: number | string
  height?: number | string
  onPress?: () => void
  style?: any
}

const ImageLoad = (props: Props) => {
  const { width, height, style, onLoad, onPress, source, onLoadStart, ...rest } = props;

  const loaded = useSharedValue(false)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(loaded.value ? 1 : 0, { duration: 400, easing: Easing.linear }),
    }
  })

  return (
    <Pressable style={[style, width ? { width } : {}, height ? { height } : {}, { overflow: "hidden", ...Shadow3 }]} onPress={() => { onPress?.() }} hitSlop={HIT_SLOP_EXPAND_20}>
      <Animated.View style={[StyleSheet.absoluteFillObject]}>
        <Blurhash
          blurhash={"LGFFaXYk^6#M@-5c,1J5@|or|Q6."}
          style={[StyleSheet.absoluteFillObject]}
        />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]}>
        <FastImage
          onLoadStart={() => {
            onLoadStart?.()
            loaded.value = false
          }}
          onLoad={(evt) => {
            onLoad?.(evt);
            loaded.value = true
          }}
          style={[width ? { width } : {}, height ? { height } : {}]}
          source={source}
          {...rest}
        />
      </Animated.View>
    </Pressable>
  )
}

export default ImageLoad;
