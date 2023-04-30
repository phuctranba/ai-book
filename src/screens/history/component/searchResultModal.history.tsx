import React, {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
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

interface TypedHistorySearchProps {
    isFocusInSearchBar: boolean;
    closeSearch: () => void
}

const DEFAULT_IMAGE = require('assets/images/book-default.png')

const SearchResultModal = forwardRef(({isFocusInSearchBar, closeSearch}: TypedHistorySearchProps, ref) => {
    const {styles, theme} = useSystem(createStyles);
    const refValueSearch = useRef<string>("")
    const freeSummaryCount = useAppSelector(state => state.system.freeSummaryCount)
    const {displayAlertAds} = useDisplayAds()
    const dispatch = useAppDispatch()

    const getListBook = useCallback(async (page: number) => {
        if (refValueSearch.current === "") return []

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
            message: languages.homeScreen.adsMoreBook.replace(":count", `${3}`),
            callback: () => {
                dispatch(setFreeSummaryCount(3))
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
                if (freeSummaryCount > 0) {
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
                <FastImage
                    source={item.volumeInfo?.imageLinks?.thumbnail ? {uri: item.volumeInfo?.imageLinks?.thumbnail} : DEFAULT_IMAGE}
                    style={{width: MHS._60, height: MHS._60, alignSelf: "center", marginRight: HS._6}}
                    resizeMode={"contain"}
                />
                <View style={{flex: 1}}>
                    <TextBase title={item.volumeInfo?.title} fontSize={FontSizes._14} color={theme.text}
                              numberOfLines={2}/>
                    {
                        item.volumeInfo?.authors?.[0] ?
                            <TextBase title={languages.homeScreen.author + item.volumeInfo?.authors?.[0]}
                                      style={{marginTop: MHS._6}}
                                      fontSize={FontSizes._12} color={theme.text} fontWeight={"bold"}
                                      numberOfLines={1}/>
                            :
                            null
                    }


                </View>
            </Pressable>
        )
    }, [theme, freeSummaryCount])

    const ListEmptyComponent = () => {
        return (
            <View style={[styles.containerEmpty]}>
                <TextBase title={languages.homeScreen.listBookEmpty} fontSize={18}/>
            </View>
        )
    }

    if (!isFocusInSearchBar)
        return null;

    return (
        <View style={styles.container}>
            <FlatList
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
