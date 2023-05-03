import React, {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef} from 'react';
import {FlatList, Image, Keyboard, Pressable, StyleSheet, View} from 'react-native';
import {useDisplayAds, useSystem} from "helpers/system.helper";
import {FontSizes, HS, MHS, VS} from "ui/sizes.ui";
import {SystemTheme} from "ui/theme";
import {useListData} from "helpers/hook.helper";
import {TypedBook} from "models/book.modal";
import {searchBook} from "../../../services/book.service";
import FastImage from "react-native-fast-image";
import TextBase from "components/TextBase";
import {languages} from "../../../languages";
import navigationHelper from "helpers/navigation.helper";
import {NAVIGATION_SUMMARY_SCREEN} from "constants/router.constant";
import {setFreeSummaryCount} from "store/reducer/system.reducer.store";
import {useAppDispatch, useAppSelector} from "configs/store.config";
import {getBookById} from "helpers/sqlite.helper";
import {randomKeyWord, randomWord} from "helpers/string.helper";

interface TypedHistorySearchProps {
    isFocusInSearchBar: boolean;
    closeSearch: () => void
    onBlur: () => void
}

const DEFAULT_IMAGE = require('assets/images/book-default.png')

const SearchResultModal = forwardRef(({isFocusInSearchBar, closeSearch, onBlur}: TypedHistorySearchProps, ref) => {
    const {styles, theme} = useSystem(createStyles);
    const refValueSearch = useRef<string>("")
    const freeSummaryCount = useAppSelector(state => state.system.freeSummaryCount)
    const {displayAlertAds, free_book} = useDisplayAds()
    const dispatch = useAppDispatch()
    const isPremium = useAppSelector(state => state.system.isPremium)
    const refIsPremium = useRef(isPremium)

    useEffect(()=>{
        refIsPremium.current = isPremium
    },[isPremium])

    const getListBook = useCallback(async (page: number) => {
        if (refValueSearch.current === ""){
            return []
        }

        if (refValueSearch.current === "c47b79xn2x8z209xcn27n"){
                refValueSearch.current = randomKeyWord()
        }

        return await searchBook({page, search: refValueSearch.current})
    }, [])


    const {
        listData,
        refreshControl,
        onEndReach,
        refreshListPage
    } = useListData<TypedBook>(true, 20, getListBook);

    useImperativeHandle(
        ref,
        () => ({
            search(text: string) {
                refValueSearch.current = text;
                refreshListPage()
            }
        })
    );

    useEffect(() => {
        if (!isFocusInSearchBar) {
            refValueSearch.current = "";
            refreshListPage()
        }
    }, [isFocusInSearchBar])

    const onAddFreeBook = useCallback((item: TypedBook) => {
        displayAlertAds({
            title: languages.homeScreen.moreBook,
            message: languages.homeScreen.adsMoreBook.replace(":count", `${free_book}`),
            callback: () => {
                dispatch(setFreeSummaryCount(free_book))
                navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {book: item})
                closeSearch()
            }
        })
    }, [])

    const onPressItem = useCallback((item: TypedBook) => {
        getBookById(item.id || "abc")
            .then((result) => {
                navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {book: result, summary: true})
                closeSearch()
            })
            .catch(() => {
                if (freeSummaryCount > 0 || refIsPremium.current) {
                    navigationHelper.navigate(NAVIGATION_SUMMARY_SCREEN, {book: item})
                    closeSearch()
                } else {
                    onAddFreeBook(item)
                }
            })
    }, [freeSummaryCount])

    const renderItemHistory = useCallback(({item}: { item: TypedBook }) => {
        return (
            <Pressable style={styles.viewItem}
                       onPress={() => onPressItem(item)}>
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
                <View style={styles.textContentView}>
                    <TextBase title={item.volumeInfo?.title} fontSize={FontSizes._14} color={theme.text}
                              numberOfLines={2}/>
                    {
                        item.volumeInfo?.authors?.[0] ?
                            <TextBase title={languages.homeScreen.author + item.volumeInfo?.authors?.[0]}
                                      style={styles.txtAuthor}
                                      fontSize={FontSizes._12} color={theme.text} fontWeight={"bold"}
                                      numberOfLines={1}/>
                            :
                            null
                    }


                </View>
            </Pressable>
        )
    }, [theme, freeSummaryCount])

    const ListEmptyComponent = useMemo(() => {
        return (
            <View style={[styles.containerEmpty]}>
                <TextBase title={languages.homeScreen.listBookEmpty} style={{textAlign:'center'}} fontSize={18}/>
            </View>
        )
    },[])

    const onScroll = useCallback(()=>{
        Keyboard.dismiss();
    },[])

    if (!isFocusInSearchBar)
        return null;

    return (
        <View style={styles.container}>
            <FlatList
                onScroll={onScroll}
                style={styles.scrollView}
                data={listData}
                keyboardShouldPersistTaps={'always'}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item: TypedBook) => item.etag || ""}
                renderItem={renderItemHistory}
                refreshControl={refreshControl()}
                ListEmptyComponent={ListEmptyComponent}
                onEndReached={onEndReach}/>
        </View>

    );
})

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            height: "100%",
            width: "100%",
            top: 0,
            left: 0,
            paddingHorizontal: HS._12,
        },
        txtAuthor:{
            marginTop: MHS._6
        },
        image:{
            width: MHS._60,
            height: MHS._80,
            alignSelf: "center",
            marginRight: HS._6,
            backgroundColor:theme.textInactive
        },
        textContentView:{
            flex: 1
        },
        imageDefault:{
            width: MHS._60,
            height: MHS._80,
            alignSelf: "center",
            marginRight: HS._6,
        },
        txtDeleteAll: {
            color: theme.text,
            textDecorationLine: 'underline',
            fontSize: FontSizes._14,
            marginTop: VS._12,
            marginBottom: VS._4,
        },
        txtTitleGroup: {
            color: theme.text,
            fontSize: FontSizes._14,
            marginTop: VS._12,
            marginBottom: VS._4,
            flex: 1,
        },
        containerEmpty: {
            justifyContent: "center",
            alignItems: 'center',
            flex: 1,
            opacity: 1,
            marginTop: VS._200
        },
        scrollView: {
            flex: 1
        },
        viewItem: {
            flexDirection: 'row',
            marginVertical: VS._10,
            alignItems: 'center'
        },
        viewItemTouch: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center'
        },
        searchIcon: {
            marginRight: HS._12
        },
        deleteIcon: {
            marginLeft: HS._12,
            marginRight: HS._4
        },
        textHistory: {
            flex: 1,
            color: theme.text,
            fontSize: FontSizes._14,
        },
        viewTop: {
            flexDirection: 'row',
            justifyContent: 'space-between'
        }
    })
}

export default memo(SearchResultModal)
