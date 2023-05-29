import * as React from 'react';
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

import {IconCheck} from 'assets/svgIcons';
import TextBase from 'components/TextBase';
import {useAppDispatch,} from 'configs/store.config';
import {EnumAnalyticEvent} from 'constants/anlytics.constant';
import {countryCode} from 'constants/country.constant';
import {NAVIGATION_WELCOME} from 'constants/router.constant';
import navigationHelper from 'helpers/navigation.helper';
import {logEventAnalytics, useDisplayAds, useSystem,} from 'helpers/system.helper';
import {FlatList, Pressable, StyleSheet, TouchableOpacity, View,} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming,} from 'react-native-reanimated';
import {FontSizes, HS, MHS, VS,} from 'ui/sizes.ui';

import {useNavigation} from '@react-navigation/native';
import AdsNativeCountry from './component/ads.native.country';
import {GlobalPopupHelper} from 'helpers/index';
import {SystemTheme} from "ui/theme";
import {setLastChoiceCountry} from "store/reducer/system.reducer.store";
import DeviceCountry from "react-native-device-country";

const Item = ({item, selected, index, setNameCountry, nameCountry}: any) => {
    const {styles} = useSystem(createStyles);
    const style = useAnimatedStyle(() => {
        return {
            // opacity:  selected.value == index ? 1 : 0,
            opacity: selected.value == index ? 1 : 0,
        };
    });

    return (
        <Pressable
            style={styles.viewItem}
            onPress={() => {
                (selected.value = withTiming(index, {duration: 0}))
                setNameCountry({name: item.name, language: item?.code})
            }}>
            <TextBase style={styles.txtItem}>
                {item.flag + ' ' + item.name}
            </TextBase>
            <View style={styles.viewRadio}>
                <Animated.View style={[styles.centerRadio, style]}/>
            </View>
        </Pressable>
    );
};

function ChooseCountry() {
    const dispatch = useAppDispatch();
    const {styles, theme} = useSystem(createStyles);
    const selected = useSharedValue(-1);
    const navigation = useNavigation();
    const nativeAdViewRef = useRef<any>();
    const [countryCodeSort, setCountryCodeSort] = useState<any[]>(countryCode);
    const {native_ads_country} = useDisplayAds();
    const [nameCountry, setNameCountry] = useState<any>()

    useLayoutEffect(
        useCallback(() => {
            navigation.setOptions({
                headerRight: () => <RenderHeaderRight/>,
            });
        }, [nameCountry]),
    );

    useEffect(() => {
        if (!native_ads_country) {
            GlobalPopupHelper.modalLoadingRef.current?.hide()
        }
    }, [native_ads_country])

    useLayoutEffect(
        useCallback(() => {
            DeviceCountry.getCountryCode()
                .then((result) => {
                    console.log(result);
                    let code = result.code.toUpperCase();
                    setCountryCodeSort(countryCode.sort(function (x, y) {
                        return x.code.includes(code) ? -1 : y.code.includes(code) ? 1 : 0;
                    }))
                })
                .catch((e) => {
                    console.log(e);
                });
        }, []), [])

    const RenderHeaderRight = useCallback(() => {
        return (
            <TouchableOpacity
                onPress={() => {
                    dispatch(setLastChoiceCountry());
                    navigationHelper.replace(NAVIGATION_WELCOME);
                }}

                style={styles.btnTopup}>
                <IconCheck size={FontSizes._28} color={theme.text}/>
            </TouchableOpacity>
        );
    }, []);

    const renderItem = useCallback(({item, index}) => {
        return <Item item={item} index={index} selected={selected} setNameCountry={setNameCountry}
                     nameCountry={nameCountry}/>;
    }, []);

    const keyExtractor = useCallback((item: any) => item.name, []);

    const onAddLoadFailed = () => {
        console.log("load failed");
        GlobalPopupHelper.modalLoadingRef.current?.hide()
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={countryCodeSort}
                removeClippedSubviews
                style={{flex: 1}}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                initialNumToRender={20}
            />

            {native_ads_country ? (
                <AdsNativeCountry
                    onAdClicked={() => logEventAnalytics(EnumAnalyticEvent.PressAdsCountry)}
                    ref={nativeAdViewRef}
                    onAdLoadFailed={onAddLoadFailed}
                />
            ) : null}
        </View>
    );
}


const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: HS._12,
            paddingBottom: VS._24,
            backgroundColor: theme.background
        },
        viewItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginVertical: VS._4,
            marginHorizontal: HS._6,
            paddingVertical: VS._8,
            paddingHorizontal: HS._10,
            borderRadius: MHS._12,
        },
        txtItem: {
            fontSize: FontSizes._18,
        },
        btnTopup: {
            marginRight: HS._10,
        },
        viewRadio: {
            // backgroundColor: RootColor.Color3,
            borderRadius: MHS._20,
            width: MHS._20,
            height: MHS._20,
            borderWidth: MHS._1,
            borderColor: theme.text,
            justifyContent: 'center',
            alignItems: 'center',
        },
        centerRadio: {
            position: 'absolute',
            borderRadius: MHS._20,
            width: MHS._14,
            height: MHS._14,
            backgroundColor: theme.text,
        },
        buttonAds: {
            width: '80%',
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: MHS._16,
        },
    });
};

export default ChooseCountry;
