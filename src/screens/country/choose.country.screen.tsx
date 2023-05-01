import {useNavigation} from "@react-navigation/native";
import {IconCheck} from "assets/svgIcons";
import TextBase from "components/TextBase";
import {useAppDispatch} from "configs/store.config";
import {EnumAnalyticEvent} from "constants/anlytics.constant";
import {countryCode} from "constants/country.constant";
import navigationHelper from "helpers/navigation.helper";
import {logEventAnalytics, useDisplayAds, useSystem} from "helpers/system.helper";
import * as React from "react";
import {useCallback, useRef} from "react";
import {FlatList, Pressable, StatusBar, StyleSheet, TouchableOpacity, View} from "react-native";
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import {setLastChoiceCountry} from "store/reducer/system.reducer.store";
import {FontSizes, HS, MHS, VS} from "ui/sizes.ui";
import AdsNativeCountry from "./component/ads.native.country";
import {GlobalPopupHelper} from "helpers/index";
import {NAVIGATION_PREMIUM_SERVICE_SCREEN} from "constants/router.constant";


const Item = ({item, selected, index}) => {
    const {theme} = useSystem()
    const style = useAnimatedStyle(() => {
        return {
            opacity: selected.value == index ? 1 : 0
        }
    })

    return (
        <Pressable style={styles.viewItem} onPress={() => selected.value = withTiming(index, {duration: 0})}>
            <TextBase style={styles.txtItem} color={theme.textDark}>{item.flag + " " + item.name}</TextBase>
            <View style={styles.viewRadio}>
                <Animated.View style={[styles.centerRadio, style]}/>
            </View>
        </Pressable>
    )
}


function ChooseCountry() {
    const dispatch = useAppDispatch();
    const {theme} = useSystem()
    const selected = useSharedValue(-1)
    const navigation = useNavigation();
    const nativeAdViewRef = useRef<any>();
    const {native_ads_country} = useDisplayAds()
    const loadAdsFailed = useRef(false)

    React.useLayoutEffect(
        useCallback(() => {
            navigation.setOptions({
                headerStyle: {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.btnLightSmoke,
                },
                headerTitleAlign: "center",
                headerTintColor: theme.textDark,
                headerLeftLabelVisible: false,
                gestureEnabled: false,
                headerRight: () => <RenderHeaderRight/>
            });
        }, [])
    );

    const RenderHeaderRight = useCallback(() => {
        return (
            <TouchableOpacity onPress={() => {
                dispatch(setLastChoiceCountry());
                navigationHelper.replace(NAVIGATION_PREMIUM_SERVICE_SCREEN)
            }} style={styles.btnTopup}>
                <IconCheck size={FontSizes._28} color={theme.textDark}/>
            </TouchableOpacity>
        );
    }, []);

    const renderItem = useCallback(({item, index}) => {
        return (
            <Item item={item} index={index} selected={selected}/>
        );
    }, []);

    const keyExtractor = useCallback((item: any) => item.name, []);

    const onAddLoadFailed = () => {
        loadAdsFailed.current = true;
        GlobalPopupHelper.modalLoadingRef.current?.hide()
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={"#00000000"} barStyle={"dark-content"} translucent/>
            <FlatList
                data={countryCode}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: HS._12,
        paddingBottom: VS._24,
    },
    viewItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: VS._4,
        marginHorizontal: HS._6,
        paddingVertical: VS._8,
        paddingHorizontal: HS._10,
        borderRadius: MHS._12
    },
    txtItem: {
        fontSize: FontSizes._18,
    },
    btnTopup: {
        marginRight: HS._10
    },
    viewRadio: {
        // backgroundColor: RootColor.Color3,
        borderRadius: MHS._20,
        width: MHS._20,
        height: MHS._20,
        borderWidth: MHS._1,
        justifyContent: "center",
        alignItems: "center"
    },
    centerRadio: {
        position: "absolute",
        borderRadius: MHS._20,
        width: MHS._14,
        height: MHS._14,
        backgroundColor: "black"
    },
    buttonAds: {
        width: "80%",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: MHS._16
    }
});

export default ChooseCountry;
