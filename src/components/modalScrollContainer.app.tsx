import React, {forwardRef, useCallback, useImperativeHandle, useRef, useState} from 'react';
import {Keyboard, Pressable, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {Device} from "ui/device.ui";
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";


interface TypedModalContainerProps {
  children: JSX.Element | JSX.Element[];
  onBackDropPress?: () => void;
  onClose?: () => void;
  handleIndicatorStyle?: StyleProp<ViewStyle>;
  backgroundStyle?: StyleProp<ViewStyle>;
  initSnapPoints?: (string | number)[];
  shouldHideKeyboard?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ModalScrollContainer = forwardRef(({
                                     children,
                                     onBackDropPress,
                                     onClose,
                                     handleIndicatorStyle,
                                     backgroundStyle,
                                     shouldHideKeyboard = true,
                                     initSnapPoints
                                   }: TypedModalContainerProps, ref) => {

  const [snapPoints] = useState<(string | number)[]>(initSnapPoints || [10000])
  const [isShow, setIsShow] = useState<boolean>(false)
  const bottomSheetRef = useRef<BottomSheet>(null);
  const aniBackground = useSharedValue<string>("rgba(0,0,0,0)")

  useImperativeHandle(
    ref,
    () => ({
      show() {
        if (shouldHideKeyboard) {
          Keyboard.dismiss();
        }
        bottomSheetRef?.current?.snapToIndex(0);
        aniBackground.value = withTiming("rgba(0,0,0,0.6)", {duration: 100})
      },
      hide() {
        bottomSheetRef?.current?.forceClose();
        aniBackground.value = withTiming("rgba(0,0,0,0)", {duration: 100})
      }
    })
  );


  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      aniBackground.value = withTiming("rgba(0,0,0,0)", {duration: 100})
      setIsShow(false)
    } else {
      setIsShow(true)
    }
  }, []);

  const styleBackground = useAnimatedStyle(() => {
    return ({
      backgroundColor: aniBackground.value
    })
  }, [])

  const onBackDrop = useCallback(() => {
    if (typeof onBackDropPress === 'function') {
      onBackDropPress();
    } else {
      bottomSheetRef?.current?.forceClose();
      aniBackground.value = withTiming("rgba(0,0,0,0)", {duration: 100})
    }
  }, [])

  const onCloseModal = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [])

  return (
    <AnimatedPressable style={[styles.container, styleBackground]}
                       onPress={onBackDrop}
                       pointerEvents={isShow ? 'auto' : 'box-none'}>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={onCloseModal}
        onChange={handleSheetChanges}
        style={{flex: 1}}
        handleIndicatorStyle={handleIndicatorStyle}
        backgroundStyle={backgroundStyle}
      >

        <BottomSheetScrollView>
          {children}
        </BottomSheetScrollView>

      </BottomSheet>
    </AnimatedPressable>

  )
})

const styles = StyleSheet.create({
    container: {
      zIndex: 10000,
      elevation: 1000,
      position: 'absolute',
      bottom: 0,
      width: Device.width,
      height: Device.heightScreen,
    }
  }
)
export default ModalScrollContainer;
