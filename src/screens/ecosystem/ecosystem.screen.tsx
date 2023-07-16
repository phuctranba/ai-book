import React, {useCallback, useLayoutEffect} from 'react';

import TextBase from 'components/TextBase';
import {useAppSelector,} from 'configs/store.config';
import {logEventAnalytics, useSystem,} from 'helpers/system.helper';
import {FlatList, Linking, Pressable, StyleSheet, View,} from 'react-native';
import {FontSizes, HS, MHS, MVS, VS,} from 'ui/sizes.ui';
import {RootColor, SystemTheme} from 'ui/theme';
import {useNavigation} from "@react-navigation/native";
import {DATA_ECOSYSTEM_ADS, HIT_SLOP_EXPAND_20} from "constants/system.constant";
import {IconPlayStore} from "assets/svgIcons";
import {Shadow2} from "ui/shadow.ui";
import FastImage from "react-native-fast-image";


const EcosystemScreen = () => {
    const {styles, theme, themeKey} = useSystem(createStyles)
    const isPremium = useAppSelector(state => state.system.isPremium)
    const navigation = useNavigation()

    const renderHeaderRight = useCallback(() => {
        return (
            <Pressable onPress={goToStore} hitSlop={HIT_SLOP_EXPAND_20} style={{paddingHorizontal: HS._20}}>
                <IconPlayStore size={MHS._18} color={theme.text}/>
            </Pressable>
        )
    }, [themeKey])

    const renderHeaderTitle = useCallback(() => {
        return (
            <View style={{alignItems: "center", paddingHorizontal: HS._16}}>
                <TextBase
                    fontSize={FontSizes._16} fontWeight="bold"
                    title={"Ecosystem"}/>
                {
                    isPremium ? (
                        <TextBase title={"Premium - V4"} color={RootColor.PremiumColor} fontSize={FontSizes._12}
                                  fontWeight="bold"/>
                    ) : null
                }
            </View>
        )
    }, [isPremium, theme])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: renderHeaderRight,
            headerTitle: renderHeaderTitle,
        })
    }, [themeKey, isPremium])

    const renderItem = ({item}) => {
        return (
            <Pressable
                onPress={() => {
                    logEventAnalytics("ecosystem_click_" + item.name)
                    // GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
                    Linking.openURL(item.link);
                }}
                style={{
                    paddingHorizontal: HS._12,
                    // backgroundColor: 'rgba(178,97,224,0.9)',
                    borderBottomColor: theme.btnLightSmoke,
                    borderBottomWidth: MHS._4,
                    paddingVertical: VS._20,
                }}>
                <View style={{flexDirection: "row", marginBottom: VS._8, width: "100%"}}>
                    <FastImage
                        source={typeof item.logo === 'number' ? item.logo : {uri: item.logo}}
                        style={{
                            width: MVS._40,
                            height: MVS._40,
                            borderRadius: MHS._4
                        }}
                        resizeMode={"contain"}
                    />
                    <View style={{flex: 1, marginHorizontal: HS._8, justifyContent: "space-around"}}>
                        <TextBase title={item.title}
                                  style={{fontWeight: "bold", fontSize: FontSizes._14, color: theme.text}}/>
                        <TextBase title={item.description} numberOfLines={2}
                                  style={{fontSize: FontSizes._12, color: theme.text}}/>
                    </View>
                </View>

                <View style={{
                    width: MHS._300,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignSelf: 'center'
                }}>
                    <FastImage
                        source={typeof item.image[0] === 'number' ? item.image[0] : {uri: item.image[0]}}
                        style={{
                            width: "32.5%",
                            height: MHS._300 / (14 / 9)
                        }}
                        resizeMode={"cover"}
                    />
                    <FastImage
                        source={typeof item.image[1] === 'number' ? item.image[1] : {uri: item.image[1]}}
                        style={{
                            width: "32.5%",
                            height: MHS._300 / (14 / 9)
                        }}
                        resizeMode={"cover"}
                    />
                    <FastImage
                        source={typeof item.image[2] === 'number' ? item.image[2] : {uri: item.image[2]}}
                        style={{
                            width: "32.5%",
                            height: MHS._300 / (14 / 9)
                        }}
                        resizeMode={"cover"}
                    />
                </View>

                <View
                    style={{...styles.buttonAds, marginTop: VS._12}}
                >
                    <TextBase title={"Install now"} numberOfLines={2} style={{fontSize: 16, color: theme.textLight}}
                              fontWeight={"bold"}/>
                </View>
            </Pressable>
        )
    }

    const renderEmptyComponent = useCallback(() => {
        return (
            <View style={styles.viewEmpty}>
                <TextBase title={"Empty"} fontSize={MHS._26} fontWeight="700" style={styles.textTitleEmpty}/>
            </View>
        )
    }, [])


    const goToStore = useCallback(() => {
        logEventAnalytics("press_go_to_store")
        Linking.openURL("https://play.google.com/store/apps/developer?id=ZipEnter");
    }, [])

    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            bounces={false}
            data={DATA_ECOSYSTEM_ADS}
            ListEmptyComponent={renderEmptyComponent}
            renderItem={renderItem}
            contentContainerStyle={{backgroundColor: theme.background}}
        />
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background
        },
        containerSafe: {
            flex: 1,
            // backgroundColor: "#ffffff",
            paddingHorizontal: HS._6
        },
        historyItem: {
            gap: HS._8,
            backgroundColor: 'rgba(178,97,224,0.9)',
            paddingVertical: VS._10,
            borderRadius: MHS._10,
            paddingHorizontal: HS._12,
            marginTop: VS._10,
            width: '100%',
            ...Shadow2
        },
        viewEmpty: {
            justifyContent: "center",
            alignItems: "center",
            marginTop: VS._100,
        },
        textTitleEmpty: {
            textAlign: "center",
            marginVertical: VS._16,
            marginHorizontal: HS._32,
            color: theme.text
        },
        iconEmpty: {
            width: MHS._66,
            height: MHS._66,
            borderRadius: MHS._66,
            backgroundColor: theme.btnActive,
            justifyContent: "center",
            alignItems: "center",
        },
        buttonAds: {
            height: MHS._50,
            justifyContent: "center",
            alignItems: "center",
            width: "70%",
            flexDirection: "row",
            alignSelf: "center",
            zIndex: 0.5,
            borderRadius: MHS._15,
            backgroundColor: theme.btnActive
        },
    })
}

export default EcosystemScreen;
