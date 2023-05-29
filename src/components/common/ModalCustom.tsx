import React from 'react';

import { Platform } from 'react-native';
import Modal from "react-native-modal";
import { Device } from 'ui/device.ui';

interface ModalCustomProps {
  nativeModal?: boolean;
  visible?: boolean;
  avoidKeyboard?: boolean;
  onDismiss?: () => void;
  onBackdropPress?: boolean
  zIndex?: number | null;
  children: React.ReactElement[] | React.ReactElement;
  animationIn?: "bounce" | "flash" | "jello" | "pulse" | "rotate" | "rubberBand" | "shake" | "swing" | "tada" | "wobble" | "bounceIn" | "bounceInDown" | "bounceInUp" | "bounceInLeft" | "bounceInRight" | "bounceOut" | "bounceOutDown" | "bounceOutUp" | "bounceOutLeft" | "bounceOutRight" | "fadeIn" | "fadeInDown" | "fadeInDownBig" | "fadeInUp" | "fadeInUpBig" | "fadeInLeft" | "fadeInLeftBig" | "fadeInRight" | "fadeInRightBig" | "fadeOut" | "fadeOutDown" | "fadeOutDownBig" | "fadeOutUp" | "fadeOutUpBig" | "fadeOutLeft" | "fadeOutLeftBig" | "fadeOutRight" | "fadeOutRightBig" | "flipInX" | "flipInY" | "flipOutX" | "flipOutY" | "lightSpeedIn" | "lightSpeedOut" | "slideInDown" | "slideInUp" | "slideInLeft" | "slideInRight" | "slideOutDown" | "slideOutUp" | "slideOutLeft" | "slideOutRight" | "zoomIn" | "zoomInDown" | "zoomInUp" | "zoomInLeft" | "zoomInRight" | "zoomOut" | "zoomOutDown" | "zoomOutUp" | "zoomOutLeft" | "zoomOutRight"
  animationOut?: "bounce" | "flash" | "jello" | "pulse" | "rotate" | "rubberBand" | "shake" | "swing" | "tada" | "wobble" | "bounceIn" | "bounceInDown" | "bounceInUp" | "bounceInLeft" | "bounceInRight" | "bounceOut" | "bounceOutDown" | "bounceOutUp" | "bounceOutLeft" | "bounceOutRight" | "fadeIn" | "fadeInDown" | "fadeInDownBig" | "fadeInUp" | "fadeInUpBig" | "fadeInLeft" | "fadeInLeftBig" | "fadeInRight" | "fadeInRightBig" | "fadeOut" | "fadeOutDown" | "fadeOutDownBig" | "fadeOutUp" | "fadeOutUpBig" | "fadeOutLeft" | "fadeOutLeftBig" | "fadeOutRight" | "fadeOutRightBig" | "flipInX" | "flipInY" | "flipOutX" | "flipOutY" | "lightSpeedIn" | "lightSpeedOut" | "slideInDown" | "slideInUp" | "slideInLeft" | "slideInRight" | "slideOutDown" | "slideOutUp" | "slideOutLeft" | "slideOutRight" | "zoomIn" | "zoomInDown" | "zoomInUp" | "zoomInLeft" | "zoomInRight" | "zoomOut" | "zoomOutDown" | "zoomOutUp" | "zoomOutLeft" | "zoomOutRight"
}

export default function ModalCustom(props: ModalCustomProps) {
  const { children, avoidKeyboard = false, visible = false, onDismiss, animationIn = "zoomIn", animationOut = "zoomInDown" } = props;

  return (
    <Modal
      isVisible={visible}
      onDismiss={onDismiss}
      avoidKeyboard={avoidKeyboard}
      animationIn={animationIn}
      animationInTiming={300}
      animationOutTiming={500}
      animationOut={animationOut}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={0}
      hideModalContentWhileAnimating={true}
      backdropColor={"black"}
      backdropOpacity={0.8}
      propagateSwipe
      useNativeDriverForBackdrop={Platform.OS == "android"}
      statusBarTranslucent
      deviceHeight={Device.heightScreen}
      onBackdropPress={onDismiss}
      // onBackButtonPress={onDismiss}
    >
      {children}
    </Modal>
  );
}
