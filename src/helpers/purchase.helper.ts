import {useEffect, useRef,} from 'react';

import {useAppDispatch, useAppSelector,} from 'configs/store.config';
import {EnumAnalyticEvent} from 'constants/anlytics.constant';
import {NAVIGATION_PREMIUM_SUCCESS_SCREEN} from 'constants/router.constant';
import {PurchaseError, requestPurchase, useIAP} from 'react-native-iap';
import {Device} from 'ui/device.ui';

import {GlobalPopupHelper} from './';
import navigationHelper from './navigation.helper';
import {logEventAnalytics, sendEventToFirestore} from './system.helper';
import {setIsPremium} from "store/reducer/system.reducer.store";

export const usePurchase = (isFocus) => {
    const {
        finishTransaction,
        currentPurchase,
        getSubscriptions,
        subscriptions,
        requestSubscription,
        products,
        getProducts,
        getAvailablePurchases,
        availablePurchases
    } =
        useIAP();
    const dispatch = useAppDispatch()
    const account = useAppSelector(state => state.user.account)
    const sendFail = useRef(false)
    const typeBuy = useRef<"subscription" | "product" | "">("")
    const callOneTime = useRef(true)


    useEffect(() => {
        const checkCurrentPurchase = async () => {
            if (!isFocus) {
                return;
            }
            try {
                GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd()
                GlobalPopupHelper.hideLoading()
                if (currentPurchase?.productId && callOneTime.current) {
                    callOneTime.current = false
                    logEventAnalytics(EnumAnalyticEvent.Purchased)

                    await getAvailablePurchases()
                    if (typeBuy.current == "subscription") {
                        dispatch(setIsPremium(true));
                        navigationHelper.replace(NAVIGATION_PREMIUM_SUCCESS_SCREEN)
                    }
                    if (typeBuy.current == "product") {
                        GlobalPopupHelper.alert({
                            type: "success",
                            message: "Thanks for your donation"
                        })
                    }

                    await finishTransaction({
                        purchase: currentPurchase,
                        isConsumable: typeBuy.current == "product" ? true : Device.isIos,
                    });
                    return;
                }
            } catch (error) {
                try {
                    await getAvailablePurchases()
                } catch (error) {

                }
                console.log("error", error);

                if (error instanceof PurchaseError) {
                    if (!sendFail.current) {
                        sendFail.current = true
                        sendEventToFirestore({
                            eventName: "purchase_failed",
                            user_email: account.user_login,
                            user_id: account._id,
                            fullname: account.display_name
                        })
                    }
                    GlobalPopupHelper.alert({
                        type: "error",
                        message: error.message
                    })
                } else {
                    if (!sendFail.current) {
                        sendFail.current = true
                        sendEventToFirestore({
                            eventName: "purchase_failed",
                            user_email: account.user_login,
                            user_id: account._id,
                            fullname: account.display_name
                        })
                    }
                    GlobalPopupHelper.alert({
                        type: "error",
                        message: error?.toString()
                    })
                }
            }
        };

        checkCurrentPurchase();
    }, [currentPurchase, finishTransaction, account._id, isFocus]);

    const initIAP = async ({
                               subscriptionIds = [],
                               productIds = []
                           }: { subscriptionIds?: string[], productIds?: string[] }) => {
        try {
            if (productIds.length > 0) {
                await getProducts({skus: productIds})
            }
            if (subscriptionIds.length > 0) {
                await getSubscriptions({skus: subscriptionIds});
            }
            await getAvailablePurchases()
        } catch (error) {
            console.log("error ABC", error);
        }
    }

    const buySubscription = async (pac) => {
        logEventAnalytics(EnumAnalyticEvent.CheckoutPurchases)
        sendFail.current = false
        typeBuy.current = "subscription"
        if (Device.isIos) {
            GlobalPopupHelper.showLoading(false)
        }
        try {
            const offerToken: string | undefined = pac?.subscriptionOfferDetails ? (pac.subscriptionOfferDetails.find(i => !!i.offerId)?.offerToken || pac?.subscriptionOfferDetails[0]?.offerToken) : undefined;
            await requestSubscription({
                sku: pac?.productId,
                ...(offerToken && {
                    subscriptionOffers: [{sku: pac?.productId, offerToken}],
                }),
            })

        } catch (error: any) {
            GlobalPopupHelper.hideLoading()
            console.log('request subcription error', error);
            if (error.code != "E_USER_CANCELLED") {
                sendEventToFirestore({
                    eventName: "purchase_failed",
                    user_email: account.user_login,
                    user_id: account._id,
                    fullname: account.display_name
                })
            }
        }
    }

    const buyProduct = async (productId) => {
        sendFail.current = false
        typeBuy.current = "product"
        if (Device.isIos) {
            GlobalPopupHelper.showLoading(false)
        }
        try {
            await requestPurchase({skus: [productId], sku: productId})
        } catch (error) {
            GlobalPopupHelper.hideLoading()
            console.log("requestPurchase error", error);
        }
    }


    return {buySubscription, buyProduct, subscriptions, initIAP, products, getAvailablePurchases, availablePurchases}
}
