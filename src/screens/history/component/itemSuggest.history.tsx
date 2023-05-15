import TextBase from 'components/TextBase';
import {useAppDispatch, useAppSelector} from 'configs/store.config';
import {NAVIGATION_SUMMARY_SCREEN} from 'constants/router.constant';
import navigationHelper from 'helpers/navigation.helper';
import {useDisplayAds, useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import React, {useCallback, useEffect, useRef} from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import {setFreeSummaryCount} from 'store/reducer/system.reducer.store';
import {FontSizes, HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import FastImage from "react-native-fast-image";
import {TypedBook} from "models/book.modal";
import {Device} from "ui/device.ui";
import {getBookById} from "helpers/sqlite.helper";

const DEFAULT_IMAGE = require('assets/images/book-default.png')


const ItemSuggestHistory = ({item}: { item: TypedBook }) => {
    const {styles, theme} = useSystem(createStyles)
    const dispatch = useAppDispatch()
    const isPremium = useAppSelector(state => state.system.isPremium)
    const refIsPremium = useRef(isPremium)
    const freeSummaryCount = useAppSelector(state => state.system.freeSummaryCount)
    const {displayAlertAds, free_credit_of_ads} = useDisplayAds()

    useEffect(() => {
        refIsPremium.current = isPremium
    }, [isPremium])


    const onAddFreeBook = useCallback((item: TypedBook) => {
        displayAlertAds({
            title: languages.homeScreen.moreBook,
            message: languages.homeScreen.adsMoreBook.replace(":count", `${free_credit_of_ads}`),
            callback: () => {
                dispatch(setFreeSummaryCount(free_credit_of_ads))
                navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {book: item})
            }
        })
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
                    onAddFreeBook(item)
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
