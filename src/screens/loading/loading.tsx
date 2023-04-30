import TextBase from "components/TextBase";
import LottieView from "lottie-react-native";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Device } from "ui/device.ui";
import { FontSizes, MHS, VS } from "ui/sizes.ui";
import { RootColor } from "ui/theme";
function Loading() {
    return (
        <View style={styles.container}>
            <Image source={Device.isAndroid ? require("assets/images/transparent.png") : require("assets/images/logo.png")}
                style={Device.isAndroid ? { width: Device.width, height: Device.width } : { width: MHS._140, height: MHS._140, borderRadius: MHS._16 }} />

            <View style={{ position: "absolute", bottom: VS._18, alignItems: "center" }}>
                <TextBase
                    title={"This action may contain ads..."}
                    style={{
                        color: RootColor.DarkBackground,
                        fontSize: FontSizes._14,
                        marginBottom: VS._6
                    }}
                />

                <LottieView
                    source={require("assets/lotties/loadingSplash.json")}
                    style={{ width: Device.width * 0.9 }}
                    loop
                    speed={0.6}
                    autoPlay />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center"
    }
});

export default Loading;
