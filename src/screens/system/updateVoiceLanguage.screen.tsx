import TextBase from 'components/TextBase';
import {useAppDispatch, useAppSelector} from 'configs/store.config';
import {useSystem} from 'helpers/system.helper';
import React, {useCallback} from 'react';
import {FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {FontSizes, HS, MHS, VS} from 'ui/sizes.ui';
import {RootColor, SystemTheme} from 'ui/theme';
import {setLanguageVoice} from "store/reducer/system.reducer.store";
import {LANGUAGE_ARRAY} from "constants/country.constant";
import {IconCheck} from "assets/svgIcons";

const UpdateVoiceLanguageScreen = () => {
    const {styles, theme} = useSystem(createStyle)
    const dispatch = useAppDispatch()
    const languageVoice = useAppSelector(state => state.system.languageVoice)


    const renderItem = useCallback(({item}: { item: { code: string, name: string } }) => {
        return (
            <TouchableOpacity activeOpacity={0.7} key={item.code} style={styles.itemContainer}
                              onPress={() => dispatch(setLanguageVoice(item))}>
                <TextBase color={languageVoice?.code == item.code ? RootColor.MainColor : theme.text} title={item.name}
                          fontWeight={'500'} fontSize={FontSizes._16}/>

                {languageVoice?.code == item.code && <IconCheck size={FontSizes._24} color={RootColor.MainColor}/>}
            </TouchableOpacity>
        )
    }, [languageVoice])

    return (
        <FlatList style={styles.container} data={LANGUAGE_ARRAY} renderItem={renderItem}/>
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

export default UpdateVoiceLanguageScreen;
