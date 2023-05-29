import React, {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Keyboard, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {Device} from "ui/device.ui";
import {FontSizes, HS, MHS, VS} from "ui/sizes.ui";
import {logEventAnalytics, useDisplayAds, useSystem} from "helpers/system.helper";
import {HIT_SLOP_EXPAND_20} from "constants/system.constant";
import {useNavigation} from "@react-navigation/native";
import {IconClose, IconLeft, IconMenu} from "assets/svgIcons";
import {RootColor, SystemTheme} from "ui/theme";
import {opacity} from "helpers/string.helper";
import TextBase from "components/TextBase";
import debounce from "lodash.debounce"
import navigationHelper from "helpers/navigation.helper";
import {NAVIGATION_SUMMARY_SCREEN} from "constants/router.constant";
import {useAppDispatch, useAppSelector} from "configs/store.config";
import {languages} from "../../../languages";
import {setFreeSummaryCount} from "store/reducer/system.reducer.store";
import {TypedBook} from "models/book.modal";
import {v4 as uuidv4} from "uuid";
import {EnumAnalyticEvent} from "constants/anlytics.constant";


interface HeaderHistoryProps {
    onEventSearchCalled: (text: string) => void;
    setIsFocusInSearchBar: (isFocus: boolean) => void;
}

const Header = forwardRef(({
                               onEventSearchCalled,
                               setIsFocusInSearchBar,
                           }: HeaderHistoryProps, ref) => {
    const {styles, theme} = useSystem(createStyles);
    const [valueSearch, setValueSearch] = useState<string>("")
    const [isFocus, setIsFocus] = useState<boolean>(false)
    const refInputSearch = useRef<any>()
    const {displayAlertAds, free_credit_of_ads} = useDisplayAds()
    const refValueSearch = useRef<string>("")
    const freeSummaryCount = useAppSelector(state => state.system.freeSummaryCount)
    const dispatch = useAppDispatch()
    const navigation: any = useNavigation()
    const fontName = useAppSelector(state => state.system.fontName)
    const isPremium = useAppSelector(state => state.system.isPremium)
    const refIsPremium = useRef(isPremium)

    useEffect(() => {
        refIsPremium.current = isPremium
    }, [isPremium])

    useImperativeHandle(
        ref,
        () => ({
            setValueWithHistory(text: string) {
                setValueSearch(text);
                refInputSearch.current.blur();
            },
            onBack,
            onFocusFind
        })
    );

    const onSearch = useCallback(() => {
        onEventSearchCalled(refValueSearch.current)
    }, [])

    const onSearchDebounce = debounce(onSearch, 500);

    const onChangeText = useCallback((text: string) => {
        refValueSearch.current = text;
        onSearchDebounce();
        setValueSearch(text)
    }, [])

    const onBack = useCallback(() => {
        refInputSearch.current.blur()
        setValueSearch("")
        setIsFocusInSearchBar(false)
        setIsFocus(false)
    }, [])

    const LeftIcon = useCallback(() => {
        if (isFocus) {
            return (
                <Pressable onPress={onBack} hitSlop={HIT_SLOP_EXPAND_20}>
                    <IconLeft size={MHS._20} color={theme.text}/>
                </Pressable>
            )
        } else return (
            <Pressable
                hitSlop={HIT_SLOP_EXPAND_20}
                style={styles.headerLeft} onPress={() => {
                Keyboard.dismiss();
                navigation.toggleDrawer();
            }}>
                <IconMenu size={MHS._20} color={theme.text}/>
            </Pressable>
        )
    }, [isFocus, theme])

    const onPressSubmit = useCallback(() => {
        if (freeSummaryCount > 0 || refIsPremium.current) {
            navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {
                book: {
                    "volumeInfo": {
                        "title": refValueSearch.current,
                    },
                }
            })
            onBack()
        } else {
            onAddFreeBook({
                "etag": uuidv4(),
                "volumeInfo": {
                    "title": refValueSearch.current,
                },
            })
        }
    }, [freeSummaryCount])

    const onAddFreeBook = useCallback((item?: TypedBook) => {
        logEventAnalytics(EnumAnalyticEvent.PressAddFreeBook)
        displayAlertAds({
            title: languages.homeScreen.moreBook,
            message: languages.homeScreen.adsMoreBook.replace(":count", `${free_credit_of_ads}`),
            callback: () => {
                dispatch(setFreeSummaryCount(free_credit_of_ads))
                if (item?.id) {
                    navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {
                        book: item
                    })
                    onBack()
                }
            }
        })
    }, [])

    const RightIcon = useCallback(() => {
        if (isFocus) {
            return (
                <Pressable onPress={onPressSubmit} style={styles.btnSummary} hitSlop={HIT_SLOP_EXPAND_20}>
                    <TextBase title={"Summary"} fontSize={FontSizes._12} color={theme.textLight} fontWeight={"bold"}/>
                </Pressable>
            )
        } else {
            if (refIsPremium.current) {
                return (
                    <TextBase title={"PREMIUM\n∞ 📖"} fontSize={FontSizes._10}
                              style={{textAlign: 'center'}}
                              color={RootColor.PremiumColor} fontWeight={"900"}/>
                )
            } else {
                return (
                    <Pressable onPress={onAddFreeBook} style={styles.btnPremium} hitSlop={HIT_SLOP_EXPAND_20}>
                        <TextBase title={freeSummaryCount + " 📖 " + languages.homeScreen.free} fontSize={FontSizes._12}
                                  color={theme.textLight} fontWeight={"bold"}/>
                    </Pressable>
                )
            }
        }
    }, [isFocus, theme, freeSummaryCount])

    const onFocus = useCallback(() => {
        onEventSearchCalled("c47b79xn2x8z209xcn27n")
        setIsFocusInSearchBar(true);
        setIsFocus(true)
    }, [])

    const onClear = useCallback(() => {
        refValueSearch.current = ""
        onEventSearchCalled(refValueSearch.current)
        setValueSearch("")
        refInputSearch.current.focus();
    }, [])

    const onFocusFind = useCallback(() => {
        logEventAnalytics(EnumAnalyticEvent.PressFindABook)
        refInputSearch.current.focus();
    }, [])

    return (
        <View style={styles.container}>
            <LeftIcon/>
            <View style={styles.viewInput}>
                <TextInput
                    ref={refInputSearch}
                    style={[styles.input, {fontFamily: fontName + "-Medium"}]}
                    placeholder={languages.homeScreen.searchBook}
                    numberOfLines={1}
                    placeholderTextColor={theme.text}
                    value={valueSearch}
                    onChangeText={onChangeText}
                    onFocus={onFocus}
                />

                {valueSearch !== "" &&
                    <Pressable
                        onPress={onClear}
                        style={styles.viewClearBtn}>
                        <IconClose size={FontSizes._10} color={theme.text}/>
                    </Pressable>}
            </View>

            <RightIcon/>

        </View>
    )
})

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.background,
            width: "100%",
            paddingTop: Device.heightPaddingStatusBar,
            paddingBottom: VS._6,
            zIndex: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: HS._16,
        },
        viewRight: {
            flexDirection: 'row',
        },
        txtExit: {
            marginLeft: HS._12,
            color: theme.text,
            fontSize: FontSizes._14,
        },
        input: {
            fontSize: FontSizes._14,
            flex: 1,
            paddingVertical: 0,
            height: "100%",
            textAlignVertical: 'center',
            paddingHorizontal: HS._10,
            color: theme.text
        },
        viewClearBtn: {
            backgroundColor: opacity(theme.text, 0.3),
            justifyContent: 'center',
            alignSelf: 'center',
            borderRadius: MHS._20,
            padding: MHS._6
        },
        btnSummary: {
            backgroundColor: theme.btnActive,
            borderRadius: MHS._6,
            paddingVertical: VS._6,
            paddingHorizontal: HS._8
        },
        btnPremium: {
            backgroundColor: RootColor.PremiumColor,
            borderRadius: MHS._6,
            paddingVertical: VS._6,
            paddingHorizontal: HS._8
        },
        viewInput: {
            flex: 1,
            flexDirection: 'row',
            borderRadius: MHS._100,
            height: "100%",
            paddingVertical: HS._6,
            paddingHorizontal: HS._8,
            marginHorizontal: HS._12,
            alignItems: 'center',
            backgroundColor: opacity(theme.text, 0.15)
        },
        btnFilterOrder: {
            width: HS._30,
            marginLeft: HS._6,
            justifyContent: 'center',
            alignItems: 'center',
        },
        backIcon: {
            marginRight: HS._12
        },
        headerLeft: {
            // paddingHorizontal: HS._16,
            // paddingVertical: HS._10
        },
    })
}

export default memo(Header)
