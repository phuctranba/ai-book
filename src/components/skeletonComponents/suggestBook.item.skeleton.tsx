import React, {memo, useMemo} from "react";
import {StyleSheet, View} from "react-native";
import {FontSizes, HS, MHS, VS} from "ui/sizes.ui";
import {useSystem} from "helpers/system.helper";
import {opacity} from "helpers/string.helper";
import SkeletonApp from "components/skeleton.app";
import {SystemTheme} from "ui/theme";
import {Device} from "ui/device.ui";

function SuggestBookItemSkeleton() {
    const {styles, theme} = useSystem(createStyles);

    const highlightColor = useMemo(() => opacity(theme.text, 0.5), [theme])
    const backgroundColor = useMemo(() => opacity(theme.text, 0.4), [theme])

    return (
        <View
            style={styles.container}>
            <SkeletonApp highlightColor={highlightColor}
                         backgroundColor={backgroundColor}
                         speed={1500}
                         direction={"left"}>
                <View style={styles.avatar}/>

                <View style={styles.viewInfo}>
                    <View style={[styles.viewTxtName, {width: '100%'}]}/>
                    <View style={[styles.viewTxtName, {width: '100%'}]}/>
                    <View style={[styles.viewTxtName, {width: '60%'}]}/>
                </View>
            </SkeletonApp>
        </View>
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            width: Device.width * 0.28,
            marginHorizontal: HS._8,
        },
        viewInfo: {
            justifyContent: "flex-start",
        },
        containerContent: {
            paddingVertical: VS._6,
            paddingHorizontal: HS._12,
            flexDirection: "row",
            alignItems: 'center',
            width: '100%'
        },
        icon: {
            marginHorizontal: HS._6
        },
        iconCoin: {
            marginLeft: HS._4
        },
        rightView: {
            alignItems: 'flex-end',
            justifyContent: 'space-between'
        },
        txtPnrShort: {
            color: theme.text,
            fontSize: FontSizes._40,
            opacity: 0.2,
            right: "20%",
            position: 'absolute',
            alignSelf: 'center',
        },
        avatar: {
            width: Device.width * 0.28,
            height: Device.width * 0.36,
            marginBottom: VS._4,
            borderRadius: MHS._4,
        },
        viewRow: {
            flexDirection: "row",
            alignItems: "center",
            marginVertical: VS._2,
        },
        viewTxtName: {
            borderRadius: MHS._2,
            height: FontSizes._10,
            marginVertical: FontSizes._1,
            // width: '100%'
        },
        txtDeadline: {
            fontSize: FontSizes._13,
        },
        txtPrice: {
            fontSize: FontSizes._16,
        },
        viewIconType: {
            width: MHS._28,
            height: MHS._24,
            borderRadius: MHS._6,
            marginBottom: VS._10
        },
    })
}

export default memo(SuggestBookItemSkeleton)
