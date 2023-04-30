import TextBase from 'components/TextBase';
import {useAppDispatch, useAppSelector} from 'configs/store.config';
import {useSystem} from 'helpers/system.helper';
import React, {useCallback} from 'react';
import {FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {FontSizes, HS, MHS, VS} from 'ui/sizes.ui';
import {RootColor, SystemTheme} from 'ui/theme';
import {setFontName} from "store/reducer/system.reducer.store";
import {IconCheck} from "assets/svgIcons";
import {FONTS} from "constants/system.constant";

const SettingsFontScreen = () => {
    const {styles, theme} = useSystem(createStyle)
    const dispatch = useAppDispatch()
    const fontName = useAppSelector(state => state.system.fontName)


    const renderItem = useCallback(({item}: { item: string }) => {
        return (
            <TouchableOpacity activeOpacity={0.7} style={styles.itemContainer}
                              onPress={() => dispatch(setFontName(item))}>
                <TextBase color={fontName == item ? RootColor.MainColor : theme.text} title={item}
                          style={{fontFamily: item+"-Medium"}}
                          fontWeight={'600'} fontSize={FontSizes._16}/>

                {fontName == item && <IconCheck size={FontSizes._24} color={RootColor.MainColor}/>}
            </TouchableOpacity>
        )
    }, [fontName])

    return (
        <FlatList style={styles.container} keyExtractor={(item) => item} data={FONTS} renderItem={renderItem}/>
    )
}

const createStyle = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background
        },
        scrollView: {
            flex: 1,
            paddingHorizontal: HS._16,
            paddingVertical: VS._20,
            backgroundColor: theme.background
        },
        viewIcon: {
            width: MHS._24,
            height: MHS._24,
            borderRadius: MHS._24,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: `${theme.btnInactive}30`,
            borderWidth: 0.5,
            marginRight: HS._10
        },
        iconActive: {
            borderColor: theme.btnInactive,
        },
        iconInactive: {
            borderColor: theme.backgroundMain,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: VS._10,
            paddingVertical: VS._4
        },
        otherReason: {
            height: VS._100,
            padding: HS._16,
            backgroundColor: theme.backgroundTextInput,
            marginTop: VS._10,
            borderRadius: MHS._10,
            fontSize: HS._16,
        },
        styleTxtDel: {
            fontWeight: "600",
            fontSize: HS._16,
        },
        btnDel: {
            marginHorizontal: 0,
            backgroundColor: theme.backgroundMain,
            height: VS._44,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: MHS._50,
            marginTop: VS._20
        },
        itemContainer: {
            width: '100%',
            paddingVertical: VS._18,
            paddingHorizontal: HS._12,
            borderBottomWidth: 0.5,
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomColor: RootColor.Smoke
        }
    })
}

export default SettingsFontScreen;
