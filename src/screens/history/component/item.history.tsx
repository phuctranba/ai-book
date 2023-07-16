import TextBase from 'components/TextBase';
import {useAppSelector} from 'configs/store.config';
import {NAVIGATION_SUMMARY_SCREEN} from 'constants/router.constant';
import {GlobalPopupHelper} from 'helpers/index';
import navigationHelper from 'helpers/navigation.helper';
import {useDisplayAds, useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import React, {useEffect, useRef} from 'react';
import {Keyboard, Pressable, StyleSheet, View} from 'react-native';
import {FontSizes, HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import FastImage from "react-native-fast-image";
import {TypedBookSummary} from "models/book.modal";
import AdsItemList from "components/Ads/ads.itemList";

const DEFAULT_IMAGE = require('assets/images/book-default.png')


const ItemHistory = ({item, index}: { item: TypedBookSummary, index: number }) => {
    const {styles, theme} = useSystem(createStyles)
    const {native_ads_pre, native_ads_list, use_native_ads} = useDisplayAds()
    const isPremium = useAppSelector(state => state.system.isPremium)
    const refIsPremium = useRef(isPremium)

    useEffect(() => {
        refIsPremium.current = isPremium
    }, [isPremium])


    const renderAds = () => {
        // if (refIsPremium.current || !native_ads_list || !use_native_ads || (index != 0 && index != 2)) {
        //     return <View style={{backgroundColor: theme.btnActive, height: 1, width: '90%', alignSelf: 'center'}}/>
        // }

        if ((index % 4 === 0) && !refIsPremium.current && native_ads_list && use_native_ads) {
            return <AdsItemList showNativeAdmob={index < 1} index={index}/>
        }

        return null

    }

    const onPressItem = () => {
        Keyboard.dismiss();
        if (refIsPremium.current) {
            onConfirmPressItem()
            return;
        }

        if (native_ads_pre) {
            GlobalPopupHelper.alertAdsRef.current?.alert({
                title: languages.homeScreen.seeConversation,
                message: languages.homeScreen.seeConversationDes,
                actions: [{
                    text: languages.confirm,
                    onPress: onConfirmPressItem
                }]
            })
        } else {
            GlobalPopupHelper.alertRef.current?.alert({
                title: languages.homeScreen.seeConversation,
                message: languages.homeScreen.seeConversationDes,
                actions: [{
                    text: languages.confirm,
                    onPress: onConfirmPressItem
                }]
            })
        }
    }

    const onConfirmPressItem = () => {
        navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {book: item, summary: true})
    }

    return (
        <View style={styles.container}>
            {
                renderAds()
            }

            <Pressable style={styles.item} onPress={onPressItem}>
                <FastImage
                    source={item.volumeInfo?.imageLinks?.thumbnail ? {uri: item.volumeInfo?.imageLinks?.thumbnail} : DEFAULT_IMAGE}
                    style={{width: MHS._60, height: MHS._60, alignSelf: "center", marginRight: HS._6}}
                    resizeMode={"contain"}
                />
                <View style={{flex: 1, marginRight: HS._8}}>
                    <TextBase title={item.volumeInfo?.title} fontSize={FontSizes._14} color={theme.text}
                              fontWeight={"bold"}
                              numberOfLines={2}/>

                    {
                        item.volumeInfo?.authors?.[0] ?
                            <TextBase title={languages.homeScreen.author + item.volumeInfo?.authors?.[0]}
                                      style={{marginTop: MHS._6}}
                                      fontSize={FontSizes._12} color={theme.text}
                                      numberOfLines={1}/>
                            :
                            null
                    }

                </View>
            </Pressable>
        </View>
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {},
        item: {
            flexDirection: "row",
            paddingHorizontal: HS._16,
            paddingVertical: VS._12,
            gap: HS._8,
            alignItems: "center"
        }
    })
}

export default ItemHistory;
