import { defaultSpringConfig, defaultTimingConfig } from 'helpers/animation.helper';
import { useSystem } from 'helpers/system.helper';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';

import {
  BackHandler,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Device } from 'ui/device.ui';
import { HS, MHS, VS } from 'ui/sizes.ui';

import ModalCustom from '../common/ModalCustom';
import { OverlayProps } from '../common/Overlay';
import Separator from '../common/Separator';
import BottomButton, { BottomButtonActionSheetProps } from './BottomButton';
import Button, { ButtonActionSheetProps } from './ButtonActionSheet';
import Header, { HeaderActionSheetProps } from './HeaderActionSheet';

type ButtonActionSheetType = {
  autoDismiss?: boolean;
  onPress?: (e: any) => void;
}
type OptionsActionSheet = (ButtonActionSheetProps | ButtonActionSheetType)[]

export interface ActionSheetViewProps {
  visible?: boolean;
  title?: string;
  message?: string;
  bottomTitle?: string;
  options?: OptionsActionSheet;
  renderContent?: () => React.FC;
  renderBackground?: () => React.FC;
  borderRadius?: number;
  width?: number | string;
  nativeModal?: boolean;
  backgroundColor?: string;
  separatorColor?: string;
  animationType?: 'spring' | 'timing';
  springAnimationConfig?: any;
  timingAnimationConfig?: any;
  onHide?: () => void;
  zIndex?: number | null;
  headerProps?: HeaderActionSheetProps;
  buttonProps?: ButtonActionSheetProps;
  bottomButtonProps?: BottomButtonActionSheetProps;
  testIDActionSheet?: string;
  accessibilityLabelActionSheet?: string;
  showStatusBar?: boolean;
  overlayProps?: OverlayProps;
  avoidKeyboard?: boolean;
}


export interface ActionSheetType {
  show: (content: ActionSheetViewProps) => void;
  hide: () => void;
}

function ActionSheetViewComponent(props: ActionSheetViewProps, ref: React.Ref<ActionSheetType>) {
  const {
    title,
    message,
    bottomTitle,
    options = [],
    width = Math.min(Device.width - 16, 450),
    backgroundColor = 'white',
    animationType = 'timing',
    springAnimationConfig = defaultSpringConfig,
    timingAnimationConfig = defaultTimingConfig,
    avoidKeyboard,
    onHide,
    borderRadius = MHS._12,
    headerProps,
    buttonProps,
    bottomButtonProps,
    testIDActionSheet,
    accessibilityLabelActionSheet,
  } = props;
  const [visible, setVisible] = useState(props.visible || false);
  const progress = useSharedValue(0);
  const backHandler = useRef<any>();
  const _mounted = useRef(false);
  const { theme } = useSystem()

  useImperativeHandle(ref, () => ({
    show: () => {
      setVisible(true);
    },
    hide: () => {
      onDismissModal();
    },
  }));

  useEffect(() => {
    if (visible) {
      backHandler.current = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
      if (animationType === 'spring') {
        progress.value = withSpring(1, springAnimationConfig);
      } else {
        progress.value = withTiming(1, timingAnimationConfig);
      }
    }
  }, [visible]);

  useEffect(() => {
    _mounted.current = true;

    return () => {
      _mounted.current = false;
    };
  }, []);

  const handleBackButton = () => {
    onDismissModal();
    return true;
  };

  const onDismissModal = useCallback(() => {
    if (backHandler.current) {
      backHandler.current.remove();
      backHandler.current = null;
    }

    progress.value = withTiming(0, { duration: 150, easing: Easing.linear }, () => {
      runOnJS(oncancel)();
    });
  }, []);

  const oncancel = useCallback(() => {
    _mounted.current && setVisible(false);
    onHide && onHide();
  }, [onHide]);

  const contentStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(progress.value, [0, 1], [Device.height, 0], Extrapolate.CLAMP) },
      ],
    };
  });

  const safeArea = useSafeAreaInsets();
  const hadHeader = title != null || message != null;


  return (
    <ModalCustom
      visible={visible}
      avoidKeyboard={avoidKeyboard}
      onDismiss={onDismissModal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View pointerEvents='box-none' style={styles.container}>
        <Animated.View testID={testIDActionSheet} accessibilityLabel={accessibilityLabelActionSheet} pointerEvents='box-none' style={contentStyle}>
          {
            <View pointerEvents='box-none' style={[styles.viewContent, { width, borderRadius, paddingTop: safeArea.top, paddingBottom: safeArea.bottom / 2 }]}>
              <View style={[styles.viewTop, { backgroundColor: theme.background, borderRadius }]}>
                {
                  hadHeader && (
                    <>
                      <Header
                        {...headerProps}
                        title={title}
                        message={message}
                      />
                      <Separator backgroundColor={theme.btnLightSmoke} />
                    </>
                  )
                }
                {
                  Array.isArray(options) && options.length > 0 && (
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={{
                        maxHeight: Device.height - (hadHeader ? 64 : 0) - (bottomTitle != null ? 56 : 0) - 16 - 24 - (safeArea.top + safeArea.bottom),
                      }}
                      bounces={false}
                    >
                      {
                        options.map((option, idx) => (
                          <React.Fragment key={String(idx)}>
                            {
                              idx > 0 && idx < options.length && <Separator backgroundColor={theme.btnLightSmoke} />
                            }
                            <Button
                              {...buttonProps}
                              {...option}
                              onPress={() => {
                                option.autoDismiss !== false && onDismissModal();
                                setTimeout(() => {
                                  option.onPress?.(onDismissModal);
                                }, 500);
                              }}
                            />
                          </React.Fragment>
                        ))
                      }
                    </ScrollView>
                  )
                }
              </View>
              {
                bottomTitle != null && (
                  <View style={styles.viewBottom}>
                    <BottomButton
                      {...bottomButtonProps}
                      borderRadius={borderRadius}
                      backgroundColor={backgroundColor}
                      onPress={onDismissModal}
                      title={bottomTitle}
                    />
                  </View>
                )
              }
            </View>
          }
        </Animated.View>
      </View>
    </ModalCustom>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  viewContent: {
    marginHorizontal: HS._8,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  viewTop: {
    overflow: 'hidden',
    flexWrap: 'nowrap',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  viewBottom: {
    marginTop: VS._8,
  },
  row: {
    height: VS._54,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(forwardRef(ActionSheetViewComponent));
