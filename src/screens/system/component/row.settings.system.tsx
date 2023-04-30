import { IconRight } from 'assets/svgIcons';
import TextBase from 'components/TextBase';
import { useSystem } from 'helpers/system.helper';
import React from 'react';

import {
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { HS, MHS, VS } from 'ui/sizes.ui';
import { SystemTheme } from 'ui/theme';

interface Props {
  title: string;
  icon: string;
  borderBottom?: boolean;
  sizeIcon?: number;
  colorIcon?: string;
  onPress?: () => void
  children?: React.ReactChild | never[] | React.ReactChild[]
  drop?: boolean
  disableOpen?: boolean
}

const Row = (props: Props) => {
  const { title, icon, borderBottom = true, sizeIcon = 18, colorIcon = "white", onPress, children, drop = false, disableOpen = false } = props;
  const { styles, theme } = useSystem(createStyle)

  return (
    <TouchableWithoutFeedback onPress={() => { onPress?.() }}>
      <View style={[
        styles.container, borderBottom ? styles.borderBottom : {}
      ]}>
        <TextBase title={title} style={styles.title} fontSize={16} fontWeight={"400"}/>
        <IconRight size={MHS._20} color={theme.text} />
      </View>
    </TouchableWithoutFeedback>
  )
}

const createStyle = (theme: SystemTheme) => {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      marginHorizontal: HS._16,
      alignItems: "center",
      paddingVertical: VS._14
    },
    iconLeft: {
      justifyContent: "center",
      width: MHS._24,
      height: MHS._24,
      alignItems: "center",
      borderRadius: MHS._4
    },
    title: {
      paddingRight: HS._8,
      flex: 1
    },
    borderBottom: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.btnLightSmoke
    },
  })
}

export default Row;
