import TextBase from 'components/TextBase';
import {useAppDispatch} from 'configs/store.config';
import {logEventAnalytics, useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {switchTheme} from 'store/reducer/system.reducer.store';
import {Device} from "ui/device.ui";
import {HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import Switch from 'components/Switch';
import {EnumAnalyticEvent} from "constants/anlytics.constant";
import {EnumTheme} from "constants/system.constant";

const SettingsThemeScreen = () => {
    const {styles, themeKey} = useSystem(createStyles);
    const dispatch = useAppDispatch()

    const onChangeTheme = () => {
        logEventAnalytics(EnumAnalyticEvent.ChangeTheme)
        dispatch(switchTheme())
    }

    return (
        <View style={styles.container}>
            <View style={styles.containerItem}>
                <View style={{flex: 1}}>
                    <TextBase title={languages.drawerContent.theme} fontSize={16}/>
                </View>
                <View style={{flexDirection: "row", alignItems: "center", gap: HS._6}}>
                    <TextBase title={themeKey == EnumTheme.Dark ? "Dark" : "Light"}/>
                    <Switch
                        value={themeKey == EnumTheme.Dark}
                        onChange={onChangeTheme}
                    />
                </View>
            </View>
        </View>

    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background
        },
        containerItem: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.btnLightSmoke,
            flexDirection: "row",
            marginHorizontal: HS._16,
            alignItems: "center",
            paddingVertical: VS._14
        },
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginHorizontal: HS._16,
            paddingVertical: VS._14,
        },
        rowContainer: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.btnLightSmoke,
            flexDirection: "row",
            marginHorizontal: HS._16,
            alignItems: "center",
            paddingVertical: VS._14
        },
        buttonGet: {
            borderRadius: MHS._19,
            marginTop: VS._10,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.btnActive,
            marginBottom: Device.paddingBottom * 1.2,
            marginHorizontal: HS._16,
            height: VS._44
        },
        title: {
            paddingRight: HS._8,
            flex: 1
        },
        imageHeader: {
            width: "100%",
            height: Device.heightPaddingStatusBar
        },
        header: {
            position: "absolute",
            right: HS._16,
            zIndex: 100,
            padding: MHS._6,
            backgroundColor: theme.background,
            borderRadius: MHS._16,
        },
        content: {
            flex: 1,
            width: "100%",
        },
        logo: {
            width: MHS._60,
            height: MHS._60,
            borderRadius: MHS._16,
            alignSelf: "center"
        },
        image: {
            width: "80%",
            height: MHS._170,
            borderRadius: MHS._10
        },
        viewImage: {
            flexDirection: "row",
            gap: HS._16,
            alignItems: "center",
            marginHorizontal: HS._16,
            backgroundColor: `${theme.btnLightSmoke}40`,
            paddingVertical: VS._20,
            borderRadius: MHS._10
        },
        itemImage: {
            flex: 1,
            alignItems: "center"
        },
        box: {
            width: MHS._24,
            height: MHS._24,
            borderRadius: MHS._24,
            borderWidth: 1,
            borderColor: theme.backgroundMain,
            marginVertical: VS._6,
            justifyContent: "center",
            alignItems: "center"
        },
        selected: {
            width: MHS._16,
            height: MHS._16,
            borderRadius: MHS._16,
            backgroundColor: theme.backgroundMain
        }
    })
}

export default SettingsThemeScreen;
