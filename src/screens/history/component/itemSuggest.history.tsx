import TextBase from 'components/TextBase';
import {useAppSelector} from 'configs/store.config';
import {NAVIGATION_PREMIUM_SERVICE_SCREEN, NAVIGATION_SUMMARY_SCREEN} from 'constants/router.constant';
import navigationHelper from 'helpers/navigation.helper';
import {useSystem} from 'helpers/system.helper';
import React, {useCallback, useEffect, useRef} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {FontSizes, HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import FastImage from "react-native-fast-image";
import {TypedBook} from "models/book.modal";
import {Device} from "ui/device.ui";
import {getBookById} from "helpers/sqlite.helper";

const DEFAULT_IMAGE = require('assets/images/book-default.png')


const ItemSuggestHistory = ({item}: { item: TypedBook }) => {
  const {styles, theme} = useSystem(createStyles)
  const isPremium = useAppSelector(state => state.system.isPremium)
  const refIsPremium = useRef(isPremium)
  const freeSummaryCount = useAppSelector(state => state.system.freeSummaryCount)

  useEffect(() => {
    refIsPremium.current = isPremium
  }, [isPremium])


  const onAddFreeBook = useCallback(() => {
    navigationHelper.navigate(NAVIGATION_PREMIUM_SERVICE_SCREEN)
  }, [])

  const onPressItem = useCallback((item: TypedBook) => {
    getBookById(item.id || "abc")
      .then((result) => {
        navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {book: result, summary: true})
      })
      .catch(() => {
        if (freeSummaryCount > 0 || refIsPremium.current) {
          navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {book: item})
        } else {
          onAddFreeBook()
        }
      })
  }, [freeSummaryCount])

  return (
    <Pressable
      onPress={() => onPressItem(item)}
      style={styles.containerItem}>
      {
        item.volumeInfo?.imageLinks?.thumbnail ?
          <FastImage
            source={{uri: item.volumeInfo?.imageLinks?.thumbnail}}
            style={styles.image}
            resizeMode={"cover"}
          />
          :
          <FastImage
            source={DEFAULT_IMAGE}
            style={styles.imageDefault}
            resizeMode={"stretch"}
          />

      }

      <TextBase title={item.volumeInfo?.title} fontSize={FontSizes._12} fontWeight={"600"} numberOfLines={3}/>

    </Pressable>
  )
}

const createStyles = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {},
    item: {
      flexDirection: "row",
      paddingHorizontal: HS._16,
      paddingVertical: VS._10,
      gap: HS._8,
      alignItems: "center"
    },
    containerItem: {
      width: Device.width * 0.28,
      marginHorizontal: HS._8,
    },
    image: {
      backgroundColor: theme.btnInactive,
      width: Device.width * 0.28,
      height: Device.width * 0.36,
      alignSelf: "center",
      marginBottom: VS._4,
      borderRadius: MHS._4,
    },
    imageDefault: {
      width: Device.width * 0.28,
      height: Device.width * 0.36,
      alignSelf: "center",
      marginBottom: VS._4,
      borderRadius: MHS._4,
    }
  })
}

export default ItemSuggestHistory;
