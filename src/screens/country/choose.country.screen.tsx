import * as React from 'react';
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

import {IconCheck} from 'assets/svgIcons';
import TextBase from 'components/TextBase';
import {useAppDispatch, useAppSelector,} from 'configs/store.config';
import {EnumAnalyticEvent} from 'constants/anlytics.constant';
import {countryCode} from 'constants/country.constant';
import {NAVIGATION_WELCOME} from "constants/router.constant";
import navigationHelper from 'helpers/navigation.helper';
import {logEventAnalytics, useDisplayAds, useSystem,} from 'helpers/system.helper';
import {FlatList, Pressable, StyleSheet, TouchableOpacity, View} from "react-native";
import Animated, {useAnimatedStyle, useSharedValue, withTiming,} from 'react-native-reanimated';
import {setLastChoiceCountry,} from 'store/reducer/system.reducer.store';
import {FontSizes, HS, MHS, VS} from "ui/sizes.ui";
import DeviceCountry from "react-native-device-country";
import {useNavigation} from '@react-navigation/native';

import AdsNativeCountry from './component/ads.native.country';
import RNBootSplash from "react-native-bootsplash";

const Item = ({item, selected, index, setNameCountry}: any) => {
    const {theme} = useSystem();
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
            <TextBase style={styles.txtItem} color={theme.textDark}>
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
    const {theme} = useSystem();
    const navigation = useNavigation();
    const nativeAdViewRef = useRef<any>();
    const [nameCountry, setNameCountry] = useState<any>()
    const [countryCodeSort, setCountryCodeSort] = useState<any[]>(countryCode);
    const {native_ads_country, nativeAdsId} = useDisplayAds()
    const getConfigDone = useAppSelector(state => state.system.getConfigDone);
    const selected = useSharedValue(-1);
    const shouldShowWelcome = useAppSelector(state => state.system.shouldShowWelcome);

    useLayoutEffect(
        useCallback(() => {
            navigation.setOptions({
                headerRight: () => <RenderHeaderRight/>,
            });
        }, [nameCountry]),
    );

    useEffect(() => {
        setTimeout(() => {
            RNBootSplash.hide({fade: false});
        }, 5000);
    }, []);

    useEffect(() => {
        if (!native_ads_country && getConfigDone) {
            RNBootSplash.hide({fade: false});
        }
    }, [native_ads_country])

    useLayoutEffect(
        useCallback(() => {
            DeviceCountry.getCountryCode()
                .then((result) => {
                    let code = result.code.toUpperCase();
                    let dataSort = countryCode.sort(function (x, y) {
                        return x.code.includes(code) ? -1 : y.code.includes(code) ? 1 : 0;
                    })

                    console.log(dataSort?.[0]?.name)
                    // setNameCountry({name: dataSort?.[0]?.name, language: dataSort?.[0]?.code})
                    setTimeout(() => {
                        selected.value = 0;
                    }, 500);

                    setCountryCodeSort(dataSort)
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
                    if(shouldShowWelcome){
                        navigationHelper.replace(NAVIGATION_WELCOME);
                    }else {
                        navigationHelper.replace("DrawerNavigator");
                    }

                }}
                style={styles.btnTopup}>
                <IconCheck size={FontSizes._28} color={theme.textDark}/>
            </TouchableOpacity>
        )
    }, []);

    const renderItem = useCallback(({item, index}) => {
        return <Item item={item} index={index} selected={selected} setNameCountry={setNameCountry}
                     nameCountry={nameCountry}/>;
    }, [selected, nameCountry]);

    const keyExtractor = useCallback((item: any) => item.name, []);

    const onAddLoadFailed = () => {
        console.log("load failed");
        RNBootSplash.hide({fade: false});
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

            {(native_ads_country && nativeAdsId) && (
                <AdsNativeCountry
                    onAdClickedAdmob={() => {
                        logEventAnalytics(EnumAnalyticEvent.PressAdsCountry);
                    }}
                    ref={nativeAdViewRef}
                    onAdLoadFailedProps={onAddLoadFailed} onNativeAdDone={undefined}                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: HS._12,
        paddingBottom: VS._24,
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
    buttonAds: {
        width: "80%",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: MHS._16,
        marginTop: VS._12,
        alignSelf: 'center'
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerRadio: {
        position: 'absolute',
        borderRadius: MHS._20,
        width: MHS._14,
        height: MHS._14,
        backgroundColor: 'black',
    },
});

export default ChooseCountry;

