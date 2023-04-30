import TextBase from 'components/TextBase';
import {useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import React, {useCallback, useRef, useState} from 'react';
import {FlatList, RefreshControl, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Device} from 'ui/device.ui';
import {HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import ItemHistory from "screens/history/component/item.history";
import HeaderHistory from "screens/history/component/header.history";
import SearchResultModalHistory from "screens/history/component/searchResultModal.history";
import {TypedBookSummary} from "models/book.modal";
import {getAllBook} from "helpers/sqlite.helper";
import {useFocusEffect} from "@react-navigation/native";

const HistoryScreen = () => {
    const {styles} = useSystem(createStyles)
    const [isFocusInSearchBar, setIsFocusInSearchBar] = useState<boolean>(false);
    const refHeaderHistory = useRef<any>()
    const refSearchResultModalHistory = useRef<any>()
    const [data, setData] = useState<TypedBookSummary[]>([])

    useFocusEffect(useCallback(() => {
        getAllBook()
            .then(setData)
            .catch(console.log)
    }, []))

    const onSearch = useCallback((text: string) => {
        refSearchResultModalHistory.current?.search(text)
    }, [])

    const renderItem = ({item, index}: { item: TypedBookSummary, index: number }) => {
        return (
            <ItemHistory item={item} index={index}/>
        )
    }

    const ListEmptyComponent = () => {
        return (
            <View style={styles.containerEmpty}>
                <TextBase title={languages.homeScreen.listBookEmpty} fontSize={18}/>
            </View>
        )
    }

    const closeSearch = useCallback(() => {
        refHeaderHistory.current?.onBack()
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
                keyExtractor={(item: TypedBookSummary) => item.id||""}
                renderItem={renderItem}
                ListEmptyComponent={ListEmptyComponent}
                refreshControl={
                    <RefreshControl refreshing={false} onRefresh={() => {
                    }}/>
                }
            />

            {
                (data.length===0 && !isFocusInSearchBar)&&
                <TouchableOpacity activeOpacity={0.8} style={styles.buttonView} onPress={()=>refHeaderHistory.current?.onFocusFind()}>
                    <TextBase title={languages.drawerContent.findABook} fontSize={16} fontWeight='600' />
                </TouchableOpacity>
            }

            <SearchResultModalHistory ref={refSearchResultModalHistory}
                                      closeSearch={closeSearch}
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
        buttonView: {
            marginBottom: Device.paddingBottom*2,
            // height: VS._44,
            paddingVertical:VS._12,
            width:'80%',
            justifyContent: "center",
            alignItems: "center",
            alignSelf:'center',
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
            flex: 1,
            opacity: 1,
            height:Device.heightScreen*0.8
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
