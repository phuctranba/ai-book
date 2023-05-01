import TextBase from 'components/TextBase';
import {useAppDispatch, useAppSelector} from 'configs/store.config';
import {EnumAnalyticEvent} from 'constants/anlytics.constant';
import {NAVIGATION_SUMMARY_SCREEN} from 'constants/router.constant';
import {GlobalPopupHelper} from 'helpers/index';
import navigationHelper from 'helpers/navigation.helper';
import {logEventAnalytics, useDisplayAds, useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Keyboard, Pressable, StyleSheet, View} from 'react-native';
import NativeAdView, {
    AdBadge,
    CallToActionView,
    HeadlineView,
    IconView,
    NativeMediaView,
    TaglineView
} from 'react-native-admob-native-ads';
import {setFirstInstall, setFreeSummaryCount, switchAdsId} from 'store/reducer/system.reducer.store';
import {FontSizes, FontWeights, HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import FastImage from "react-native-fast-image";
import {TypedBook, TypedBookSummary} from "models/book.modal";
import {Device} from "ui/device.ui";
import {getBookById} from "helpers/sqlite.helper";

const DEFAULT_IMAGE = require('assets/images/book-default.png')


const ItemSuggestHistory = ({item}: { item: TypedBook}) => {
    const {theme} = useSystem(createStyles)
    const dispatch = useAppDispatch()
    const isPremium = useAppSelector(state => state.system.isPremium)
    const refIsPremium = useRef(isPremium)
    const freeSummaryCount = useAppSelector(state => state.system.freeSummaryCount)
    const {displayAlertAds, free_book} = useDisplayAds()

    useEffect(()=>{
        refIsPremium.current = isPremium
    },[isPremium])


    const onAddFreeBook = useCallback((item: TypedBook) => {
        displayAlertAds({
            title: languages.homeScreen.moreBook,
            message: languages.homeScreen.adsMoreBook.replace(":count", `${free_book}`),
            callback: () => {
                dispatch(setFreeSummaryCount(free_book))
                navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {book: item})
            }
        })
    }, [])

    const onPressItem = useCallback((item: TypedBook) => {
        if (freeSummaryCount > 0 || refIsPremium.current) {
            navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {book: item})
        } else {
            onAddFreeBook(item)
        }
    }, [freeSummaryCount])

    return (
        <Pressable
            onPress={() => onPressItem(item)}
            style={{width: Device.width * 0.3, marginHorizontal: HS._8}}>
            <FastImage
                source={item.volumeInfo?.imageLinks?.thumbnail ? {uri: item.volumeInfo?.imageLinks?.thumbnail} : DEFAULT_IMAGE}
                style={{
                    backgroundColor: theme.btnInactive,
                    width: Device.width * 0.3,
                    height: Device.width * 0.40,
                    alignSelf: "center",
                    marginBottom: VS._4
                }}
                resizeMode={"cover"}
            />
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
        }
    })
}

export default ItemSuggestHistory;
