import {useAppDispatch, useAppSelector} from "configs/store.config";
import {EnumAnalyticEvent} from "constants/anlytics.constant";
import dayjs from "dayjs";
import {useEffect, useRef, useState} from "react";
import {PurchaseError, requestPurchase, useIAP} from "react-native-iap";
import {setIsPremium} from "store/reducer/system.reducer.store";
import {createOrderPackage, inappPurchaseApple, inappPurchaseGoogle} from "store/reducer/user.reducer.store";
import {Device} from "ui/device.ui";
import {GlobalPopupHelper} from ".";
import navigationHelper from "./navigation.helper";
import {logEventAnalytics, sendEventToFirestore} from "./system.helper";
import {v4 as uuidv4} from "uuid";
import {NAVIGATION_PREMIUM_SUCCESS_SCREEN} from "constants/router.constant";

export const usePurchase = (isFocus) => {
    const {
        finishTransaction,
        currentPurchase,
        getSubscriptions,
        subscriptions,
        requestSubscription,
        products,
        getProducts,
        getAvailablePurchases
    } =
        useIAP();
    const dispatch = useAppDispatch()
    const account = useAppSelector(state => state.user.account)
    const listPlan = useAppSelector(state => state.user.listPlan)
    const sendSuccess = useRef(false)
    const sendFail = useRef(false)
    const typeBuy = useRef<"subscription" | "product" | "">("")


    const sendDataToServer = async (current, itemStore, type = "subscription") => {
        const res: any = await dispatch(createOrderPackage({
            plan_id: listPlan?.[0]?._id,
            payment_method: Device.isAndroid ? "google_payment" : "apple_payment",
            amount_of_package: "1",
        }));
        if (!res.payload?.data) {
            return
        }
        const dataPurchase = {
            order_id: current.transactionId || "",
            product_id: current.productId,
            developer_payload: "abc",
            package_name: current.packageNameAndroid || "",
            purchase_time: new Date().getTime().toString(),
            purchase_token: (Device.isAndroid ? current.purchaseToken : current.transactionReceipt) || "",
            purchase_state: Device.isIos ? "" : (current.purchaseStateAndroid ? current.purchaseStateAndroid.toString() : "0"),
            quantity: "1",
            acknowledged: Device.isIos ? "true" : (current.isAcknowledgedAndroid ? "true" : "false"),
            local_order_id: res.payload.data?._id,
        }
        if (Device.isIos || type == "subscription") {
            // @ts-ignore
            delete dataPurchase.developer_payload
        }
        if (!sendSuccess.current) {
            sendSuccess.current = true
            sendEventToFirestore({
                user_email: account.user_login,
                user_id: account._id,
                eventName: "purchased",
                fullname: account.display_name,
                params: {
                    confirmation: res.payload.data?._id,
                    payment_method: Device.isAndroid ? "Google Payment" : "Apple Payment",
                    payment_date: dayjs().format("MMM DD,YYYY"),
                    payment_amount: itemStore?.description,
                }
            })
        }

        if (Device.isIos) {
            dispatch(inappPurchaseApple(dataPurchase))

        } else {
            dispatch(inappPurchaseGoogle(dataPurchase))
        }
    }

    useEffect(() => {
        const checkCurrentPurchase = async () => {
            if (!isFocus || !typeBuy.current) {
                return;
            }
            const itemStore = subscriptions.find(i => i.productId == currentPurchase?.productId)
            try {
                if (currentPurchase?.productId) {
                    logEventAnalytics(EnumAnalyticEvent.Purchased)
                    sendDataToServer(currentPurchase, itemStore, typeBuy.current)
                    await finishTransaction({
                        purchase: currentPurchase,
                        isConsumable: Device.isIos,
                    });

                    await getAvailablePurchases()
                    GlobalPopupHelper.hideLoading()
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

                    return;
                }
                GlobalPopupHelper.hideLoading()
            } catch (error) {
                GlobalPopupHelper.hideLoading()
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
                            fullname: account.display_name,
                            params: {
                                confirmation: uuidv4(),
                                payment_method: Device.isAndroid ? "Google Payment" : "Apple Payment",
                                payment_date: dayjs().format("MMM DD,YYYY"),
                                payment_amount: itemStore?.description,
                            }
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
        if (Device.isIos) {
            GlobalPopupHelper.showLoading(false)
        }
        const itemStore = subscriptions.find(i => i.productId == currentPurchase?.productId)

        logEventAnalytics(EnumAnalyticEvent.CheckoutPurchases)
        sendFail.current = false
        sendSuccess.current = false
        typeBuy.current = "subscription"
        try {
            const offerToken: string | undefined = pac?.subscriptionOfferDetails ? pac?.subscriptionOfferDetails[0]?.offerToken : undefined;
            await requestSubscription({
                sku: pac?.productId,
                ...(offerToken && {
                    subscriptionOffers: [{sku: pac?.productId, offerToken}],
                }),
            })

        } catch (error: any) {
            console.log('request subcription error', error);
            if (error.code != "E_USER_CANCELLED") {
                sendEventToFirestore({
                    eventName: "purchase_failed",
                    user_email: account.user_login,
                    user_id: account._id,
                    fullname: account.display_name,
                    params: {
                        confirmation: uuidv4(),
                        payment_method: Device.isAndroid ? "Google Payment" : "Apple Payment",
                        payment_date: dayjs().format("MMM DD,YYYY"),
                        payment_amount: itemStore?.description,
                    }
                })
            }
        }
    }

    const buyProduct = async (productId) => {
        sendFail.current = false
        sendSuccess.current = false
        typeBuy.current = "product"
        try {
            await requestPurchase({skus: [productId], sku: productId})
        } catch (error) {
            console.log("requestPurchase error", error);
        }
    }


    return {buySubscription, buyProduct, subscriptions, initIAP, products}
}

export const usePremium = () => {
    const {availablePurchases, getAvailablePurchases} = useIAP();
    const [isPremium, setIsPremium] = useState(false)
    const subscriptionIds = useAppSelector(state => state.system.subscriptionIds)

    useEffect(() => {
        const getListSubscription = async () => {
            try {
                await getAvailablePurchases()
            } catch (error) {
                console.log("init error", error)
            }
        }
        getListSubscription()
    }, [subscriptionIds])

    useEffect(() => {
        setIsPremium(Array.isArray(availablePurchases) && availablePurchases.find(item => subscriptionIds.find(i => i == item?.productId)) ? true : false)
    }, [availablePurchases, subscriptionIds])

    return {isPremium}
}
