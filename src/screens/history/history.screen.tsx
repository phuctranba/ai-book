import TextBase from 'components/TextBase';
import {useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import React, {useCallback, useRef, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Device} from 'ui/device.ui';
import {FontSizes, HS, MHS, VS} from 'ui/sizes.ui';
import {RootColor, SystemTheme} from 'ui/theme';
import ItemHistory from "screens/history/component/item.history";
import HeaderHistory from "screens/history/component/header.history";
import SearchResultModalHistory from "screens/history/component/searchResultModal.history";
import {TypedBook, TypedBookSummary} from "models/book.modal";
import {getAllBook} from "helpers/sqlite.helper";
import {useFocusEffect} from "@react-navigation/native";
import LottieView from "lottie-react-native";
import {searchBook} from "../../services/book.service";
import {randomKeyWord} from "helpers/string.helper";
import ItemSuggestHistory from "screens/history/component/itemSuggest.history";

const EMPTY = require("assets/lotties/empty.json")

const HistoryScreen = () => {
    const {styles} = useSystem(createStyles)
    const [isFocusInSearchBar, setIsFocusInSearchBar] = useState<boolean>(false);
    const refHeaderHistory = useRef<any>()
    const refSearchResultModalHistory = useRef<any>()
    const [data, setData] = useState<TypedBookSummary[]>([])
    const [dataSuggestBook, setDataSuggestBook] = useState<TypedBook[]>([])

    useFocusEffect(useCallback(() => {
        getAllBook()
            .then((result) => {
                if (result.length > 0) {
                    setData(result)
                } else {
                    searchBook({page: 1, search: randomKeyWord()})
                        .then(setDataSuggestBook)
                        .catch(console.log)
                }
            })
            .catch((error) => {
                console.log(error)
                searchBook({page: 1, search: randomKeyWord()})
                    .then(setDataSuggestBook)
                    .catch(console.log)
            })
    }, []))

    const onSearch = useCallback((text: string) => {
        refSearchResultModalHistory.current?.search(text)
    }, [])

    const renderItem = ({item, index}: { item: TypedBookSummary, index: number }) => {
        return (
            <ItemHistory item={item} index={index}/>
        )
    }


    const renderItemSuggest = ({item}: { item: TypedBook, index: number }) => {
        return (
            <ItemSuggestHistory item={item}/>
        )
    }

    const ListEmptyComponent = () => {
        return (
            <View style={styles.containerEmpty}>
                <LottieView source={EMPTY}
                            autoPlay
                            loop
                            speed={1.5}
                            colorFilters={[{
                                keypath: 'face', color: RootColor.MainColor
                            }]}
                            style={styles.emptyLottie}/>
                <TextBase title={languages.homeScreen.listBookEmpty} style={{textAlign: 'center'}} fontSize={18}/>
            </View>
        )
    }

    const closeSearch = useCallback(() => {
        refHeaderHistory.current?.onBack()
    }, [])

    const onBlur = useCallback(() => {
        refHeaderHistory.current?.onBlur()
    }, [])

    return (
        <View style={styles.container}>
            <HeaderHistory
                ref={refHeaderHistory}
                setIsFocusInSearchBar={setIsFocusInSearchBar}
                onEventSearchCalled={onSearch}
            />

            <FlatList
                data={data}
                style={{flex: 1}}
                extraData={data}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item: TypedBookSummary) => item.id || ""}
                renderItem={renderItem}
                ListEmptyComponent={ListEmptyComponent}
            />

            {
                (data.length === 0 && !isFocusInSearchBar) &&
                <View>
                    <TextBase title={languages.homeScreen.maybeYouLiked}
                              style={{
                                  marginHorizontal: HS._12,
                                  marginBottom: VS._12,
                                  textAlign: 'center',
                                  alignSelf: 'flex-start'
                              }}
                              fontWeight={'900'}
                              color={RootColor.MainColor}
                              fontSize={FontSizes._16}/>
                    <FlatList
                        data={dataSuggestBook}
                        horizontal
                        style={{marginBottom: VS._20}}
                        contentContainerStyle={{paddingHorizontal: HS._8}}
                        extraData={dataSuggestBook}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item: TypedBook) => item.etag || ""}
                        renderItem={renderItemSuggest}
                        ListEmptyComponent={ListEmptyComponent}
                    />

                    <TouchableOpacity activeOpacity={0.8} style={styles.buttonView}
                                      onPress={() => refHeaderHistory.current?.onFocusFind()}>
                        <TextBase title={languages.drawerContent.findABook} fontSize={16} fontWeight='600'/>
                    </TouchableOpacity>
                </View>

            }

            <SearchResultModalHistory ref={refSearchResultModalHistory}
                                      closeSearch={closeSearch}
                                      onBlur={onBlur}
                                      isFocusInSearchBar={isFocusInSearchBar}/>
        </View>
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background
        },
        headerLeft: {
            paddingHorizontal: HS._16,
            paddingVertical: HS._10
        },
        emptyLottie: {
            width: '100%'
        },
        buttonView: {
            marginBottom: Device.paddingBottom * 2,
            // height: VS._44,
            paddingVertical: VS._14,
            width: '80%',
            justifyContent: "center",
            alignItems: "center",
            alignSelf: 'center',
            backgroundColor: theme.backgroundMain,
            borderRadius: MHS._10,
        },
        list: {
            flex: 1
        },
        viewLottie: {
            width: '100%',
            height: VS._240
        },
        containerEmpty: {
            justifyContent: "center",
            alignItems: 'center',
        },
        viewInput: {
            flexDirection: 'row',
            borderRadius: MHS._16,
            alignItems: 'center',
            paddingHorizontal: HS._16,
            justifyContent: "center",
            borderColor: theme.textInactive,
            borderWidth: MHS._1,
        },
    })
}

export default HistoryScreen;
