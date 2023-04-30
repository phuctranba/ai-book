import React, {useEffect} from 'react';
import {Platform, StyleSheet} from 'react-native';
import WrapActionSheetView from 'components/ActionSheet/WrapActionSheetView';
import AdsReward from 'components/Ads/ads.reward';
import WrapAlertView from 'components/Alert/WrapAlertView';
import {GlobalPopupApp} from 'components/appConponents/globalPopup.app.component';
import WrapDropdown from 'components/DropdownAlert/wrapDropdown';
import getStore, {persistor} from 'configs/store.config';
import {GlobalPopupHelper} from 'helpers/index';
import {createDB} from 'helpers/sqlite.helper';
import AppNavigation from 'navigation/index';
import DeviceInfo from 'react-native-device-info';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {Provider} from 'react-redux';
import {PersistGate} from "redux-persist/integration/react";
import SpInAppUpdates, {IAUUpdateKind, StartUpdateOptions} from 'sp-react-native-in-app-updates';
import OpenAppAds from 'components/OpenAppAds/open.app.ads';
import AlertViewAds from 'components/Alert/AlertViewAds';
import LoadingOpenApp from 'components/LoadingOpenApp';
import {withIAPContext} from 'react-native-iap';

const store = getStore();

const App = () => {
    useEffect(() => {
        createDB().catch((error) => console.log(error, "7nc94nc348"));
        checkUpdateFromStore()
    }, [])

    const checkUpdateFromStore = () => {
        const inAppUpdates = new SpInAppUpdates(
            false // isDebug
        );
        // curVersion is optional if you don't provide it will automatically take from the app using react-native-device-info
        inAppUpdates.checkNeedsUpdate({curVersion: DeviceInfo.getVersion()}).then((result) => {
            console.log("result checkNeedsUpdate", result);

            if (result.shouldUpdate) {
                GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
                const updateOptions = Platform.select({
                    ios: {
                        title: 'Update available',
                        message: "There is a new version of the app available on the App Store, do you want to update it?",
                        buttonUpgradeText: 'Update',
                        buttonCancelText: 'Cancel',
                        // country: 'it', // 👈🏻 the country code for the specific version to lookup for (optional)
                    },
                    android: {
                        updateType: IAUUpdateKind.IMMEDIATE,
                    },
                }) as StartUpdateOptions;
                inAppUpdates.startUpdate(updateOptions); // https://github.com/SudoPlz/sp-react-native-in-app-updates/blob/master/src/types.ts#L78
            }
        }).catch((error) => {
            console.log("error checkNeedsUpdate", error);
        });
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <AppNavigation/>
                        <GlobalPopupApp ref={GlobalPopupHelper.globalUIRef}/>
                        <WrapDropdown ref={GlobalPopupHelper.globalAlertRef}/>
                        <WrapAlertView ref={GlobalPopupHelper.alertRef}/>
                        <AlertViewAds ref={GlobalPopupHelper.alertAdsRef}/>
                        <AdsReward ref={GlobalPopupHelper.adsRewardRef}/>
                        <WrapActionSheetView ref={GlobalPopupHelper.actionSheetRef}/>
                        <OpenAppAds ref={GlobalPopupHelper.admobGlobalRef}/>
                        <LoadingOpenApp ref={GlobalPopupHelper.modalLoadingRef}/>
                    </PersistGate>
                </Provider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default withIAPContext(App);
