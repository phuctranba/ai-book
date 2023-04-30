import {useAppDispatch} from "configs/store.config";
import {NAVIGATION_PREMIUM_SERVICE_SCREEN, NAVIGATION_PREMIUM_SUCCESS_SCREEN} from "constants/router.constant";
import navigationHelper from "helpers/navigation.helper";
import {logEventAnalytics, useDisplayAds} from "helpers/system.helper";
import React, {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import {AppState, AppStateStatus, View} from "react-native";
import mobileAds, {MaxAdContentRating, useAppOpenAd} from "react-native-google-mobile-ads";
import {switchAdsId} from "store/reducer/system.reducer.store";
import {EnumAnalyticEvent} from "constants/anlytics.constant";

export interface TypedRefAdmob {
    setIgnoreOneTimeAppOpenAd: () => void;
    showOpenAds: (routerName?: string) => void;
    checkIsOpenLoad: boolean
}

export interface TypedAdmobProps {
    enableAppOpenAd?: boolean;
}

export const Admob = forwardRef(({enableAppOpenAd = true}: TypedAdmobProps, ref: React.Ref<TypedRefAdmob>) => {
    const appState = useRef(AppState.currentState);
    const {open_ads, openAdsId} = useDisplayAds()
    const canShowOpenAdmob = useRef<boolean>(true);
    const dispatch = useAppDispatch()
    const refRouterName = useRef<string | undefined>()
    const [isReadyToLoadAdmob, setIsReadyToLoadAdmob] = useState(false)
    const appOpenAd = useAppOpenAd(openAdsId, {
        requestNonPersonalizedAdsOnly: true,
    });

    //Hàm này siêu cần cho open ads
    useEffect(() => {
        mobileAds()
            .setRequestConfiguration({
                // Update all future requests suitable for parental guidance
                maxAdContentRating: MaxAdContentRating.PG,

                // Indicates that you want your content treated as child-directed for purposes of COPPA.
                tagForChildDirectedTreatment: true,

                // Indicates that you want the ad request to be handled in a
                // manner suitable for users under the age of consent.
                tagForUnderAgeOfConsent: true
            })
            .then(() => {
                mobileAds()
                    .initialize()
                    .then(adapterStatuses => {
                        setIsReadyToLoadAdmob(true);
                    })
                    .catch((error: any) => {
                        console.log(error);
                    });
            })
            .catch((error: any) => {
                console.log(error);
            });

    }, []);

    useImperativeHandle(
        ref,
        () => ({
            setIgnoreOneTimeAppOpenAd,
            showOpenAds,
            checkIsOpenLoad: appOpenAd.isLoaded
        }),
        [appOpenAd.isLoaded, open_ads]
    );

    const showOpenAds = (routerName) => {
        if (open_ads) {
            if (appOpenAd.isLoaded) {
                appOpenAd.show();
            } else {
                navigationHelper.replace(routerName)
            }
            if (routerName)
                refRouterName.current = routerName;
        } else {
            navigationHelper.replace(routerName)
        }
    };

    useEffect(() => {
        if (isReadyToLoadAdmob && open_ads) {
            if (enableAppOpenAd) {
                console.log("Load open")
                appOpenAd.load();
            }
        }
    }, [appOpenAd.load, isReadyToLoadAdmob, open_ads, enableAppOpenAd]);

    useEffect(() => {
        if (appOpenAd.isClosed) {
            if (refRouterName.current) {
                if (navigationHelper.getRouteName() != refRouterName.current) {
                    navigationHelper.replace(refRouterName.current)
                }
                refRouterName.current = undefined
            }
        }
        if (enableAppOpenAd && appOpenAd.isClosed && !appOpenAd.isLoaded) {
            appOpenAd.load();
        }
    }, [appOpenAd.isClosed, appOpenAd.isLoaded, enableAppOpenAd]);

    const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
        if (appState.current.match(/inactive|background/) && nextAppState === "active" && appOpenAd.isLoaded) {
            if (open_ads) {
                if (canShowOpenAdmob.current && navigationHelper.getRouteName() !== NAVIGATION_PREMIUM_SERVICE_SCREEN && navigationHelper.getRouteName() !== NAVIGATION_PREMIUM_SUCCESS_SCREEN) {
                    if (!appOpenAd.isShowing) {
                        appOpenAd.show();
                    }
                } else {
                    canShowOpenAdmob.current = true;
                }
            }
        }
        appState.current = nextAppState;
    }, [appOpenAd, open_ads]);


    useEffect(() => {
        if (appOpenAd.isAdImpression) {
            logEventAnalytics(EnumAnalyticEvent.OpenAdsImpression)
            console.log(EnumAnalyticEvent.OpenAdsImpression)
        }
    }, [appOpenAd.isAdImpression]);

    useEffect(() => {
        if (appOpenAd.error && appOpenAd.showFail) {
            logEventAnalytics(EnumAnalyticEvent.OpenAdsShowFail, {
                code: appOpenAd.error?.code,
                message: appOpenAd.error?.message
            })
            console.log(EnumAnalyticEvent.OpenAdsShowFail)
        }
        if (appOpenAd.error && !appOpenAd.showFail) {
            logEventAnalytics(EnumAnalyticEvent.OpenAdsLoadFail, {
                code: appOpenAd.error?.code,
                message: appOpenAd.error?.message
            })
            console.log(EnumAnalyticEvent.OpenAdsLoadFail)

            console.log("Call switchAdsId open")
            dispatch(switchAdsId("open"))
        }
    }, [appOpenAd.error, appOpenAd.showFail]);

    useEffect(() => {
        if (appOpenAd.isLoaded && refRouterName.current) {
            appOpenAd.show()
        }
        const subscriptionAppState = AppState.addEventListener("change", handleAppStateChange);

        return () => {
            subscriptionAppState.remove();
        };
    }, [appOpenAd.isLoaded, open_ads]);

    const setIgnoreOneTimeAppOpenAd = () => {
        canShowOpenAdmob.current = false;
    };

    return (
        <View/>
    );
});

export default memo(Admob);
