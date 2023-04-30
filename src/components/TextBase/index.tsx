import {useAppSelector} from "configs/store.config";
import {EnumTheme} from "constants/system.constant";
import React, {memo} from "react";
import isEqual from "react-fast-compare";

import {StyleProp, Text, TextProps} from "react-native";
import {FontSizes} from "ui/sizes.ui";

interface Props extends TextProps {
    title?: string | string[];
    style?: StyleProp<any>;
    numberOfLines?: number;
    fontSize?: number;
    fontWeight?: "400" | "normal" | "bold" | "100" | "200" | "300" | "500" | "600" | "700" | "800" | "900" | undefined;
    color?: string;
    textAlign?: "center" | "left" | "right"
    fontStyle?:"normal" | "italic" | undefined
}

const FontTail = {
    normal: '-Medium',
    bold: '-Bold',
    '100': '-Thin',
    '200': '-Light',
    '300': '-ExtraLight',
    '400': '-Medium',
    '500': '-Medium',
    '600': '-SemiBold',
    '700': '-Bold',
    '800': '-ExtraBold',
    '900': '-Black',
};

const TextBase = (props: Props) => {
    const {
        style,
        title,
        children,
        numberOfLines,
        fontSize = FontSizes._14,
        fontWeight = "500",
        textAlign = "left",
        fontStyle
    } = props;
    // const isBold = fontWeight == "600" || fontWeight == "700" || fontWeight == "900" || fontWeight == "bold"
    const theme = useAppSelector(state => state.system.theme)
    const color = props.color || (theme == EnumTheme.Dark ? "#F3F3F3" : "#474747");
    const sizeText = useAppSelector(state => state.system.sizeText)
    const fontName = useAppSelector(state => state.system.fontName)

    return (
        <Text
            {...props}
            allowFontScaling={false}
            numberOfLines={numberOfLines}
            style={[
                {
                    fontSize: fontSize * sizeText,
                    color,
                    includeFontPadding: false,
                    fontFamily: fontName+FontTail[fontWeight]+(fontStyle==="italic"?"Italic":"")
                },
                {textAlign},
                // {fontWeight: fontWeight},
                // {
                //     fontFamily: isBold ? "SVN-Outfit-Bold" : "SVN-Outfit-Regular",
                // },
                style,
            ]}
        >
            {title || ""}
            {children}
        </Text>
    )
}

export default memo(TextBase, isEqual);
