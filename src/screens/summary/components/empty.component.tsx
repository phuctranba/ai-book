import TextBase from 'components/TextBase';
import {HIT_SLOP_EXPAND_10} from 'constants/system.constant';
import {useSystem} from 'helpers/system.helper';
import {languages} from 'languages';
import React, {memo} from 'react';
import isEqual from 'react-fast-compare';
import {Pressable, StyleSheet, View} from 'react-native';
import { Device } from 'ui/device.ui';
import {FontSizes, HS, MHS, VS} from 'ui/sizes.ui';
import {SystemTheme} from 'ui/theme';
import {useSampleConstant} from './utils';

const ListEmptyComponent = ({onUserSendText}) => {
    const {styles} = useSystem(createStyles)
    const {questionSample} = useSampleConstant()

    return (
        questionSample.length>0?
            <View style={styles.viewEmpty}>
            <TextBase title={languages.homeScreen.tryAskMeAbout}/>
            <View style={styles.viewItem}>
                {
                    questionSample.map(i => (
                        <Pressable key={i} style={styles.itemEmpty}
                                   onPress={() => onUserSendText(i)}
                                   hitSlop={HIT_SLOP_EXPAND_10}>
                            <TextBase fontSize={FontSizes._10} title={i}/>
                        </Pressable>
                    ))
                }
            </View>

        </View>
            : null
    )
}

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        viewEmpty: {
            // backgroundColor: `${theme.btnInactive}40`,
            transform: Device.isAndroid ? [{
                rotate: "180deg"
            }] : [{
                rotateX: "180deg"
            }],
            paddingVertical: VS._16,
            paddingHorizontal: HS._12,
        },
        viewItem: {
            marginTop: VS._6,
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        itemEmpty: {
            padding: MHS._8,
            borderWidth: 1,
            borderColor: theme.text,
            marginHorizontal: HS._4,
            borderRadius: MHS._6,
            marginVertical: VS._4,
        },
    })
}

export default memo(ListEmptyComponent, isEqual);
