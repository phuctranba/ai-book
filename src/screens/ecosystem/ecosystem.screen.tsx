import React, {useCallback, useLayoutEffect, useState} from 'react';
import debounce from "lodash.debounce";
import TextBase from 'components/TextBase';
import {logEventAnalytics, useSystem,} from 'helpers/system.helper';
import {FlatList, Linking, Pressable, StyleSheet, TextInput, View,} from 'react-native';
import {FontSizes, HS, MHS, MVS, VS,} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import {useNavigation} from "@react-navigation/native";
import {DATA_ECOSYSTEM_ADS, HIT_SLOP_EXPAND_20} from "constants/system.constant";
import {IconArrowLeft, IconPlayStore, IconSearch} from "assets/svgIcons";
import {Shadow2} from "ui/shadow.ui";
import FastImage from "react-native-fast-image";
import {Device} from "ui/device.ui";
import navigationHelper from "helpers/navigation.helper";


const EcosystemScreen = () => {
    const {styles, theme} = useSystem(createStyles)
    const navigation = useNavigation()

    const [data, setData] = useState(DATA_ECOSYSTEM_ADS)

    const onSearch = useCallback((text) => {
        let valueSearch = text.trim().toLowerCase();
        if (valueSearch.length === 0) {
            setData(DATA_ECOSYSTEM_ADS)
        } else {
            setData(() => DATA_ECOSYSTEM_ADS.filter((item => item.name.toLowerCase().includes(valueSearch) || item.description.toLowerCase().includes(valueSearch))))
        }
    }, []);

    const onSearchDebounce = debounce(onSearch, 200);

    const renderHeaderTitle = useCallback(() => {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: HS._2,
                backgroundColor: theme.background,
                width: Device.width,
                paddingTop: Device.heightStatusBar * 1.3,
                paddingBottom: Device.heightStatusBar * 0.3,
                ...Shadow2
            }}>
                <Pressable onPress={() => navigationHelper.goBack()} hitSlop={HIT_SLOP_EXPAND_20}
                           style={{paddingHorizontal: HS._8}}>
                    <IconArrowLeft color={theme.text} size={MHS._26}/>
                </Pressable>
                <View style={{
                    backgroundColor: theme.backgroundTextInput,
                    borderRadius: MHS._8,
                    flex: 1,
                    paddingHorizontal: HS._10,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <IconSearch color={theme.textInactive} size={FontSizes._16}/>
                    <TextInput placeholder={"Search in Ecosystem"}
                               onChangeText={onSearchDebounce}
                               returnKeyType={'search'}
                               style={{
                                   paddingVertical: MHS._6,
                                   marginLeft: HS._4,
                                   marginRight: HS._8,
                                   color: theme.text
                               }}/>
                </View>
                <Pressable onPress={goToStore} hitSlop={HIT_SLOP_EXPAND_20} style={{paddingHorizontal: HS._14}}>
                    <IconPlayStore size={FontSizes._20} color={theme.text}/>
                </Pressable>
            </View>
        )
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            header: renderHeaderTitle,
        })
    }, [])

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
            data={data}
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
