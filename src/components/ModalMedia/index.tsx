import { IconLeft } from "assets/svgIcons";
import { useSystem } from "helpers/system.helper";
import React, { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Modal from "react-native-modal";
import { Device } from "ui/device.ui";
import { FontSizes, HS } from "ui/sizes.ui";
import { RootColor, SystemTheme } from "ui/theme";

import TextBase from "components/TextBase";
import { IImageInfo } from "react-native-image-zoom-viewer/built/image-viewer.type";
export interface TypedRefModalMedia {
  show: (media: IImageInfo[], index: number) => void
  hide: () => void
}

const ModalMedia = forwardRef((_, ref: React.Ref<TypedRefModalMedia>) => {
  const { styles } = useSystem(createStyles);
  const [visible, setVisible] = useState(false);
  const refIndexAlbum = useRef(0);
  const refMediaData = useRef<IImageInfo[]>([]);

  useImperativeHandle(ref, () => ({
    show(media: IImageInfo[], index: number) {
      refMediaData.current = media;
      refIndexAlbum.current = index;
      setVisible(true);
    },
    hide() {
      setVisible(false);
    },
  }));

  const close = useCallback(() => setVisible(false), []);


  const renderIndicator = (currentIndex?: number | undefined, allSize?: number | undefined) => {
    return (
      <>
        <View style={styles.viewHeader}>
          <TextBase style={styles.viewHeaderText}>
            {currentIndex}/{allSize}
          </TextBase>
        </View>
      </>
    );
  };

  return (
    <Modal
      isVisible={visible}
      animationIn={"fadeInUp"}
      animationOut={"fadeOutDown"}
      hideModalContentWhileAnimating={true}
      backdropColor={"transparent"}
      backdropOpacity={1}
      hasBackdrop={false}
      propagateSwipe
      useNativeDriverForBackdrop={Platform.OS == "android"}
      statusBarTranslucent
      style={styles.modal}
      deviceHeight={Device.heightScreen}
      onBackButtonPress={close}
    >
      <View style={styles.containerModalBlock}>
        <ImageViewer
          index={refIndexAlbum.current}
          imageUrls={refMediaData.current}
          enableImageZoom={true}
          enableSwipeDown={true}
          saveToLocalByLongPress={false}
          style={{ width: Device.width }}

          onSwipeDown={() => {
            setVisible(false);
          }}
          renderIndicator={(currentIndex, allSize) => renderIndicator(currentIndex, allSize)}
          renderHeader={() => (
            <TouchableOpacity style={[styles.btnTop, { left: HS._18 }]} onPress={close}>
              <IconLeft width={FontSizes._16} height={FontSizes._16} />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
});

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    modal: {
      flex: 1,
      margin: 0
    },
    btnTop: {
      height: 36,
      width: 36,
      borderRadius: 50,
      position: "absolute",
      top: (Platform.OS === 'ios' && !Device.isX) ? 20 : 64,
      zIndex: 1000000,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    containerModal: {
      height: "100%",
      width: Device.width,
      justifyContent: "center",
      alignItems: "center",
      margin: 0,
      backgroundColor: RootColor.DarkBackground,
    },
    containerModalBlock: {
      width: Device.width,
      height: Device.heightScreen,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: "black"
    },
    video: {
      width: "100%",
      flex: 1,
      alignSelf: "center",
      position: "relative",
      backgroundColor: "#000",
    },
    viewHeader: {
      top: (Platform.OS === 'ios' && !Device.isX) ? 26 : 66,
      width: "100%",
      position: "absolute",
      textAlign: "center",
      alignItems: "center",
      height: 36,
      alignContent: "center",

    },
    viewHeaderText: {
      fontWeight: "900",
      color: theme.textLight,
      backgroundColor: "rgba(255,255,255,0.3)",
      overflow: "hidden",
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 4,
      zIndex: 10000,
    }
  });
};

export default memo(ModalMedia);
