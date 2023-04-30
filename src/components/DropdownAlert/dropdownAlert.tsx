import { defaultTimingConfig } from 'helpers/animation.helper';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';

import {
  Pressable,
  StyleSheet,
  TextProps,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  PanGestureHandlerEventPayload
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { Device } from 'ui/device.ui';

import TextBase from '../TextBase';
import { HIT_SLOP_EXPAND_20 } from "constants/system.constant";
import { IconCheck, IconClose, IconDangerous, IconInfo, IconWarning } from 'assets/svgIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type DropdownType = 'info' | 'warning' | 'success' | 'error';

interface MessageProps extends TextProps {
  value?: string;
  color?: string;
  style?: TextStyle,
}

export interface TitleProps extends TextProps {
  value?: string;
  color?: string;
  style?: TextStyle,
}

export interface DropdownAlertViewProps {
  title?: string;
  message?: string;
  type?: DropdownType;
  timeDismiss?: number,
  autoHide?: boolean,
  infoColor?: string,
  warnColor?: string,
  errorColor?: string,
  successColor?: string,
  timingAnimationConfig?: Object;
  onHide?: () => void;
  showStatusBar?: boolean;
  titleProps?: TitleProps;
  messageProps?: MessageProps;
  testIDDropdown?: string;
  accessibilityLabelDropdown?: string;
  contentStyle?: ViewStyle;
  imageStyle?: ViewStyle;
  hasStatusBar?: boolean
}

export interface DropdownAlertType {
  show: (content: DropdownAlertViewProps) => void;
}

function DropdownAlertViewComponent(props: DropdownAlertViewProps, ref: React.Ref<DropdownAlertType>) {
  const {
    title,
    message,
    type = 'success',
    timeDismiss = 3000,
    autoHide = true,
    infoColor = '#2B73B6',
    warnColor = '#FF821E',
    errorColor = '#cc3232',
    successColor = '#32A54A',
    timingAnimationConfig = defaultTimingConfig,
    onHide,
    titleProps,
    messageProps,
    testIDDropdown,
    accessibilityLabelDropdown,
    imageStyle = {},
    hasStatusBar = true
  } = props;
  const [visible, setVisible] = useState(false);
  const translateY = useSharedValue(0);
  const _mounted = useRef<any>();
  const _timeoutDismiss = useRef<any>();
  const safeArea = useSafeAreaInsets();

  useImperativeHandle(ref, () => ({
    show: () => {
      setVisible(true);
    },
    hide: () => {
      dismissDropdown();
    },
  }));

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(Device.height, timingAnimationConfig, () => {
        if (autoHide) {
          runOnJS(autoHideDropdown)();
        }
      });
    }
  }, [visible, autoHide]);

  useEffect(() => {
    _mounted.current = true;

    return () => {
      _mounted.current = false;
    };
  }, []);

  const autoHideDropdown = useCallback(() => {
    if (_timeoutDismiss.current) {
      clearTimeout(_timeoutDismiss.current);
    }

    _timeoutDismiss.current = setTimeout(() => {
      dismissDropdown();
    }, timeDismiss);
  }, [_timeoutDismiss.current, timeDismiss]);

  const oncancel = useCallback(() => {
    if (_timeoutDismiss.current) {
      clearTimeout && clearTimeout(_timeoutDismiss.current);
    }

    _mounted.current && setVisible(false);
    onHide && onHide();
  }, [onHide, _mounted.current, _timeoutDismiss.current]);

  const dismissDropdown = useCallback(() => {
    translateY.value = withTiming(0, { duration: 100 }, () => {
      runOnJS(oncancel)();
    });
  }, [oncancel]);

  const gesture = Gesture.Pan()
    .onUpdate((event: PanGestureHandlerEventPayload) => {
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      if (translateY.value > Device.height - 20) {
        translateY.value = withTiming(Device.height, timingAnimationConfig);
      } else {
        runOnJS(dismissDropdown)();
      }
    })

  const contentStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: Math.min(translateY.value, Device.height) },
      ],
    };
  });

  const backgroundColor = type === 'info' ? infoColor : type === 'error' ? errorColor : type === 'warning' ? warnColor : successColor;

  const renderIcon = () => {
    switch (type) {
      case "info":
        return <IconInfo size={36} color={"white"} style={[styles.image, imageStyle]} />
      case "error":
        return <IconDangerous size={36} color={"white"} style={[styles.image, imageStyle]} />
      case "warning":
        return <IconWarning size={36} color={"white"} style={[styles.image, imageStyle]} />
      default:
        return <IconCheck size={36} color={"white"} style={[styles.image, imageStyle]} />
    }
  }


  return (
    <View
      pointerEvents='box-none'
      style={[StyleSheet.absoluteFillObject]}
    >
      <GestureDetector gesture={gesture}>

        <Animated.View style={[styles.container, { backgroundColor, paddingTop: hasStatusBar ? safeArea.top : 0 }, contentStyle]}>
          {
            <View testID={testIDDropdown} accessibilityLabel={accessibilityLabelDropdown} style={[styles.viewContent, props.contentStyle]}>
              {renderIcon()}
              <View style={styles.content}>
                {
                  title != null && <TextBase numberOfLines={1} {...titleProps} title={title} style={[titleProps?.style, { color: titleProps?.color || "white" }]} />
                }
                {
                  message != null && (
                    <TextBase numberOfLines={2} {...messageProps} title={message} style={[messageProps?.style, { color: messageProps?.color || "white" }]} />
                  )
                }
              </View>
              <Pressable onPress={dismissDropdown} style={styles.iconRight} hitSlop={HIT_SLOP_EXPAND_20}>
                <IconClose color="white" size={20} />
              </Pressable>
            </View>
          }
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -Device.height,
  },
  viewContent: {
    flexDirection: 'row',
    minHeight: 65,
  },
  image: {
    padding: 8,
    alignSelf: 'center',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  iconRight: {
    padding: 8,
    alignSelf: 'center',
    marginRight: 8,
  },
});

const DropdownAlertView = React.memo(forwardRef(DropdownAlertViewComponent));

export default DropdownAlertView;
