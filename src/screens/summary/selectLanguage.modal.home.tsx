import React, {forwardRef, memo, useCallback, useImperativeHandle, useRef} from "react";
import {Pressable, StyleSheet} from "react-native";
import {FontSizes, MHS, VS} from "ui/sizes.ui";
import {useSystem} from "helpers/system.helper";
import {TypedRefModal} from "models/user.model";
import {RootColor, SystemTheme} from "ui/theme";
import {Shadow3} from "ui/shadow.ui";
import TextBase from "components/TextBase";
import {LANGUAGE_ARRAY} from "constants/country.constant";
import ModalScrollContainer from "components/modalScrollContainer.app";
import {useAppDispatch} from "configs/store.config";
import {setLanguageVoice} from "store/reducer/system.reducer.store";

const SelectLanguageModal = forwardRef(({callback}: { callback: Function }, ref: React.Ref<TypedRefModal>) => {
    const {styles, theme} = useSystem(createStyles);
    const dispatch = useAppDispatch();
    const refModalContainer = useRef<any>();

    useImperativeHandle(
        ref,
        () => ({
            show() {
                if (refModalContainer.current) {
                    refModalContainer.current.show();
                }
            },
            hide() {
                if (refModalContainer.current)
                    refModalContainer.current.hide();
            }
        })
    );

    const close = useCallback(() => {
        if (refModalContainer.current)
            refModalContainer.current.hide();
    }, [])

    const renderItem = (item: { code: string, name: string, longCode: string }) => {
        return (
            <Pressable key={item.code} style={{
                width: '100%',
                paddingVertical: VS._18,
                alignItems: 'center',
                borderBottomWidth: 0.5,
                borderBottomColor: RootColor.Smoke
            }} onPress={() => {
                dispatch(setLanguageVoice(item));
                callback?.();
            }}>
                <TextBase color={"#000000"} title={item.name} fontWeight={'500'} fontSize={FontSizes._16}/>
            </Pressable>
        )
    }

    return (
        <ModalScrollContainer ref={refModalContainer} handleIndicatorStyle={styles.handleIndicatorStyle}
                              backgroundStyle={styles.backgroundStyle}
                              initSnapPoints={["70%"]}>
            <TextBase color={RootColor.MainColor} title={"Select language"} fontWeight={'bold'} fontSize={FontSizes._20}
                      style={{alignSelf: 'center', marginTop: VS._16}}/>
            {LANGUAGE_ARRAY.map(renderItem)}
        </ModalScrollContainer>
    );
});

const createStyles = (theme: SystemTheme) => {
    return StyleSheet.create({
        container: {
            alignItems: "center",
            borderTopLeftRadius: MHS._18,
            borderTopRightRadius: MHS._18,
            width: "100%",
            paddingHorizontal: "5%",
            paddingBottom: VS._60,
            paddingTop: VS._24,
            backgroundColor: RootColor.WhiteSmoke,
            // flex:1
        },
        contentContainer: {
            // flex:1
            height: 300,
            backgroundColor: 'red'
        },
        handleIndicatorStyle: {
            backgroundColor: "#000000"
        },
        backgroundStyle: {
            backgroundColor: RootColor.WhiteSmoke
        },
        txtTitle: {
            color: theme.text,
            fontSize: FontSizes._16,
            textAlign: 'center'
        },
        txtTip: {
            width: "60%",
            color: theme.text,
            fontSize: FontSizes._12,
            textAlign: 'justify'
        },
        lottieSleep: {
            width: '40%',
        },
        viewRow: {
            flexDirection: 'row',
            alignItems: 'center'
        },
        btnGotIt: {
            position: 'absolute',
            bottom: VS._44,
            width: '70%',
            borderRadius: MHS._50,
            paddingVertical: VS._16,
            alignItems: 'center',
            ...Shadow3
        },
        txtGotIt: {
            color: theme.text,
            fontSize: FontSizes._16,
        }
    });
};

export default memo(SelectLanguageModal);
