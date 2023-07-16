import AsyncStorage from "@react-native-async-storage/async-storage";
import {createAsyncThunk, createSlice, isFulfilled} from "@reduxjs/toolkit";
import axios from "axios";
import {APP_URL} from "configs/index";
import {serializeAxiosError} from "configs/reducer.config";
import {EnumTheme, ID_ECOSYSTEM, updateDataEcosystemAdmob} from "constants/system.constant";
import {cleanEntity} from "helpers/object.helper";
import {TypedEcosystem} from "models/ecosystem.model";
import DeviceInfo from "react-native-device-info";
import {Subscription} from "react-native-iap/lib/typescript/src/types";
import {Platform} from "react-native";
import {TestIds} from "react-native-google-mobile-ads";
import {TestIds as TestNativeIds} from "react-native-admob-native-ads";
import remoteConfig from "@react-native-firebase/remote-config";
import {setLoadedConfig} from "store/reducer/control.reducer.store";


interface InitialState {
    theme: EnumTheme
    language: string
    languageVoice: { code: string, name: string, longCode: string } | undefined
    subscriptionIds: string[]
    listNativeAdsId: string[]
    dataEcosystemAdmob: any[]
    tokenFirebase: string
    isConnectedInternet: boolean
    suggestQuestion: boolean
    fontName: string
    stateToImpression: object
    speedSSEMessage: 1 | 2 | 3 | 4 | 5,
    getConfigDone: boolean,
    useNormalSummary: boolean,
    sizeText: 0.9 | 1 | 1.1 | 1.2 | 1.3,
    firstInstall: {
        language: boolean
        isUSUnit: boolean
        chooseCountry: boolean
        responseFromGPT: boolean
        firstLogin: boolean
        firstSettingChat: boolean
    }
    nativeAdsId: string
    rewardAdsId: string
    openAdsId: string
    bannerAdsId: string
    config: {
        native_ads_pre: boolean
        native_ads_after: boolean
        native_ads_country: boolean
        chatgpt_key: string
        key_google_cloud: string
        key_reward_ads: string
        key_native_ads: string
        key_banner_ads: string
        use_banner_ads: boolean
        free_credit_of_ads: number
        key_open_ads: string
        use_native_ads: boolean
        use_reward_ads: boolean,
        use_open_ads: boolean,
        native_ads_list: boolean,
    }
    shouldShowWelcome: boolean
    isPremiumTrial: {
        overWord: string
        cleanChat: string
        changeTheme: string
        addNewChat: string
        changeModel: string
        renameGroup: string
    },

    enableSpeech: boolean,
    isPressRate: boolean,
    freeSummaryCount: number,
    freeVoice: number,
    subscriptionsLocal: Subscription[],
    genderVoice: "Male" | "Female",
    isPremium: boolean,
    ecosystem: TypedEcosystem[],
    freeGiftCount: number,
    lastChoiceCountry: Date | undefined
}

const initialState: InitialState = {
    theme: EnumTheme.Light,
    subscriptionIds: [],
    listNativeAdsId: [],
    dataEcosystemAdmob: [],
    language: "en",
    languageVoice: undefined,
    tokenFirebase: "",
    stateToImpression: {},
    isConnectedInternet: true,
    suggestQuestion: false,
    getConfigDone: false,
    speedSSEMessage: 2,
    useNormalSummary: true,
    sizeText: 1,
    fontName: "Raleway",
    firstInstall: {
        language: false,
        isUSUnit: false,
        chooseCountry: false,
        responseFromGPT: false,
        firstLogin: false,
        firstSettingChat: false
    },
    nativeAdsId: "",
    rewardAdsId: "",
    openAdsId: "",
    bannerAdsId: "",
    config: {
        native_ads_pre: true,
        native_ads_after: true,
        native_ads_country: true,
        key_banner_ads: "",
        use_banner_ads: false,
        chatgpt_key: "",
        key_google_cloud: "",
        key_reward_ads: "",
        key_native_ads: "",
        free_credit_of_ads: -1,
        key_open_ads: "",
        use_reward_ads: true,
        use_open_ads: true,
        native_ads_list: true,
        use_native_ads: true
    },
    shouldShowWelcome: true,
    isPremiumTrial: {
        overWord: "",
        cleanChat: "",
        changeTheme: "",
        addNewChat: "",
        changeModel: "",
        renameGroup: ""
    },

    enableSpeech: true,
    isPressRate: false,
    freeSummaryCount: 0,
    freeVoice: 0,
    subscriptionsLocal: [],
    genderVoice: "Male",
    isPremium: false,
    ecosystem: [],
    freeGiftCount: 2,
    lastChoiceCountry: undefined
};

/**
 * ZipEnter
 * Be used to set token firebase to account
 */
export const setTokenFirebase = createAsyncThunk(
    "system/setTokenFirebase",
    async (token: string) => {
        let paramDevice = {
            device_uuid: await DeviceInfo.getUniqueId(),
            device_signature: token,
        };

        let response = await axios.patch<any>(`${APP_URL.APP_AJAX_URL}/user/update-session`, cleanEntity(paramDevice));
        if (response.status === 200) {
            await AsyncStorage.setItem("whitegFcmToken", token);
            return token;
        } else throw "error update firebase token";
    },
    {serializeError: serializeAxiosError}
);

export const getSystem = createAsyncThunk(
    "system/getSystem",
    async (_, thunkApi) => {
        await remoteConfig()
            .setDefaults({
                [`native_ads_pre_${Platform.OS}`]: false,
                [`native_ads_after_${Platform.OS}`]: false,
                [`native_ads_country_${Platform.OS}`]: false,
                [`native_ads_list_${Platform.OS}`]: false,
                [`key_native_ads_${Platform.OS}`]: "",
                [`key_reward_ads_${Platform.OS}`]: "",
                [`key_banner_ads_${Platform.OS}`]: "",
                [`use_banner_ads_${Platform.OS}`]: false,
                [`use_reward_ads_${Platform.OS}`]: false,
                [`key_open_ads_${Platform.OS}`]: "",
                [`use_open_ads_${Platform.OS}`]: false,
                [`use_native_ads_${Platform.OS}`]: false,
                [`free_credit_of_ads`]: 3,
            })
            .then(() => remoteConfig().fetchAndActivate())


        const native_ads_pre = remoteConfig().getValue(`native_ads_pre_${Platform.OS}`);
        const native_ads_after = remoteConfig().getValue(`native_ads_after_${Platform.OS}`);
        const native_ads_country = remoteConfig().getValue(`native_ads_country_${Platform.OS}`);
        const native_ads_list = remoteConfig().getValue(`native_ads_list_${Platform.OS}`);
        const key_banner_ads = remoteConfig().getValue(`key_banner_ads_${Platform.OS}`);
        const use_banner_ads = remoteConfig().getValue(`use_banner_ads_${Platform.OS}`);
        const key_native_ads = remoteConfig().getValue(`key_native_ads_${Platform.OS}`);
        const key_reward_ads = remoteConfig().getValue(`key_reward_ads_${Platform.OS}`);
        const use_reward_ads = remoteConfig().getValue(`use_reward_ads_${Platform.OS}`);
        const key_open_ads = remoteConfig().getValue(`key_open_ads_${Platform.OS}`);
        const use_open_ads = remoteConfig().getValue(`use_open_ads_${Platform.OS}`);
        const use_native_ads = remoteConfig().getValue(`use_native_ads_${Platform.OS}`);
        const free_credit_of_ads = remoteConfig().getValue(`free_credit_of_ads`);
        thunkApi.dispatch(setLoadedConfig())

        return ({
            use_native_ads: use_native_ads.asBoolean(),
            native_ads_pre: native_ads_pre.asBoolean(),
            native_ads_after: native_ads_after.asBoolean(),
            native_ads_country: native_ads_country.asBoolean(),
            native_ads_list: native_ads_list.asBoolean(),
            use_reward_ads: use_reward_ads.asBoolean(),
            use_open_ads: use_open_ads.asBoolean(),
            use_banner_ads: use_banner_ads.asBoolean(),
            key_banner_ads: __DEV__ ? TestIds.BANNER : (key_banner_ads.asString() || ""),
            key_native_ads: __DEV__ ? TestNativeIds.Image : (key_native_ads.asString() || ""),
            key_reward_ads: __DEV__ ? TestIds.REWARDED : (key_reward_ads.asString() || ""),
            key_open_ads: __DEV__ ? TestIds.APP_OPEN : (key_open_ads.asString() || ""),
            free_credit_of_ads: Number.isInteger(free_credit_of_ads.asNumber())?free_credit_of_ads.asNumber(): 3,
        })
    },
    {serializeError: serializeAxiosError}
);

export const getEcosystem = createAsyncThunk(
    "system/getEcosystem",
    async (_, thunkApi) => {
        return await axios.get<TypedEcosystem[]>("https://chat-gpt-api.iceo.tech/api/eco-system/list?page=1&limit=100&order_by=DESC&white_list=" + ID_ECOSYSTEM)
    },
    {serializeError: serializeAxiosError}
);

export const System = createSlice({
    name: "system",
    initialState,
    reducers: {
        switchTheme: (state) => {
            try {
                if (state.theme === EnumTheme.Dark)
                    return {
                        ...state,
                        theme: EnumTheme.Light,
                    };
                else
                    return {
                        ...state,
                        theme: EnumTheme.Dark,
                    };
            } catch (error) {
                return {
                    ...state,
                    theme: EnumTheme.Dark,
                };
            }
        },
        setLanguage: (state, action) => {
            return {
                ...state,
                language: action.payload,
            };
        },
        setIsPressRate: (state, action) => {
            return {
                ...state,
                isPressRate: action.payload,
            };
        },
        setSuggestQuestion: (state, action) => {
            return {
                ...state,
                suggestQuestion: action.payload
            }
        },
        setStateToImpression: (state, action) => {
            return {
                ...state,
                stateToImpression: {...state.stateToImpression, ...action.payload}
            }
        },
        setSpeedSSEMessage: (state, action) => {
            return {
                ...state,
                speedSSEMessage: action.payload
            }
        },
        setSizeText: (state, action) => {
            return {
                ...state,
                sizeText: action.payload
            }
        },
        setSubscriptionIds: (state, action) => {
            return {
                ...state,
                subscriptionIds: action.payload,
            };
        },
        setIsPremiumTrial: (state, action) => {
            return {
                ...state,
                isPremiumTrial: {
                    ...state.isPremiumTrial,
                    ...action.payload
                },
            };
        },
        resetIsPremiumTrial: (state) => {
            return {
                ...state,
                isPremiumTrial: {
                    overWord: "",
                    cleanChat: "",
                    changeTheme: "",
                    addNewChat: "",
                    changeModel: "",
                    renameGroup: ""
                },
            }
        },
        setFirstInstall: (state, action) => {
            return {
                ...state,
                firstInstall: {
                    ...state.firstInstall,
                    ...action.payload,
                },
            };
        },
        setIsConnectedInternet: (state, action) => {
            return {
                ...state,
                isConnectedInternet: action.payload,
            };
        },
        setRatingApp: (state, action) => {
            return {
                ...state,
                ratingApp: action.payload,
            };
        },
        setShouldShowWelcome:(state, action) => {
            return {
                ...state,
                shouldShowWelcome: action.payload,
            };
        },
        setLanguageVoice: (state, action) => {
            return {
                ...state,
                languageVoice: action.payload,
            };
        },
        setFreeSummaryCount: (state, action) => {
            console.log(action)
            return {
                ...state,
                freeSummaryCount: state.freeSummaryCount + action.payload,
            };
        },
        setFreeGiftCount: (state, action) => {
            return {
                ...state,
                freeGiftCount: state.freeGiftCount + action.payload,
            };
        },
        setFreeVoice: (state, action) => {
            return {
                ...state,
                freeVoice: state.freeVoice + action.payload,
            };
        },
        setFontName: (state, action) => {
            return {
                ...state,
                fontName: action.payload,
            };
        },
        switchEnableSpeech: (state) => {
            return {
                ...state,
                enableSpeech: !state.enableSpeech,
            };
        },
        setUseNormalSummary: (state, action) => {
            return {
                ...state,
                useNormalSummary: action.payload
            };
        },
        setEnableSpeech: (state, action) => {
            return {
                ...state,
                enableSpeech: action.payload,
            };
        },
        setSubscriptionsLocal: (state, action) => {
            return {
                ...state,
                subscriptionsLocal: action.payload,
            };
        },
        setGenderVoice: (state, action) => {
            return {
                ...state,
                genderVoice: action.payload,
            };
        },
        setIsPremium: (state, action) => {
            return {
                ...state,
                isPremium: action.payload,
            };
        },
        setSystem: (state, action) => {
            return {
                ...state,
                config: action.payload
            }
        },
        setLastChoiceCountry: (state) => {
            state.lastChoiceCountry = new Date()
        },
        switchAdsId: (state, action) => {
            let currentId, keyCurrentId, listIds, newConfig;
            switch (action.payload) {
                case "native": {
                    currentId = state.nativeAdsId;
                    keyCurrentId = "nativeAdsId";
                    listIds = state.config.key_native_ads.split("#")
                    newConfig = {
                        native_ads_pre: false,
                        native_ads_after: false,
                        native_ads_login: false,
                        native_ads_chat: false,
                        native_ads_list: false,
                        native_ads_country: false,
                        use_native_ads: false
                    }
                    break;
                }
                case "banner": {
                    currentId = state.bannerAdsId;
                    keyCurrentId = "bannerAdsId";
                    listIds = state.config.key_banner_ads.split("#")
                    newConfig = {
                        use_banner_ads: false
                    }
                    break;
                }
                case "reward": {
                    currentId = state.rewardAdsId;
                    keyCurrentId = "rewardAdsId";
                    listIds = state.config.key_reward_ads.split("#")
                    newConfig = {
                        use_reward_ads: false
                    }
                    break;
                }
                default: {
                    currentId = state.openAdsId;
                    keyCurrentId = "openAdsId";
                    listIds = state.config.key_open_ads.split("#")
                    newConfig = {
                        use_open_ads: false
                    }
                    break;
                }
            }

            let newCurrentNativeAdsId;
            let indexOfCurrentKey = listIds.indexOf(currentId);
            if (indexOfCurrentKey === -1) {
                newCurrentNativeAdsId = listIds?.[0]
            } else {
                if (listIds.length >= indexOfCurrentKey + 2) {
                    newCurrentNativeAdsId = listIds?.[indexOfCurrentKey + 1]
                    newConfig = {}
                } else {
                    newCurrentNativeAdsId = listIds?.[0]
                }
            }

            return ({
                ...state,
                config: {
                    ...state.config,
                    ...newConfig
                },
                [keyCurrentId]: newCurrentNativeAdsId
            })
        },
        setDataEcosystemAdmob: (state, action) => {
            let dataFilter = (action.payload||[]).filter(item=>item?.package!==DeviceInfo.getBundleId())
            updateDataEcosystemAdmob(dataFilter);
            console.log(DeviceInfo.getBundleId())
            console.log(action.payload)
            return {
                ...state,
                dataEcosystemAdmob: action.payload,
            };
        },
        setEcosystemConfig: (state, action) => {
            console.log(action.payload)
            return {
                ...state,
                getConfigDone: true,
                config: {
                    ...state.config,
                    ...action.payload
                },
            };
        },
    },
    extraReducers(builder) {
        builder
            .addCase(setTokenFirebase.fulfilled, (state, action) => {
                state.tokenFirebase = action.payload;
            })
            .addCase(getEcosystem.fulfilled, (state, action) => {
                state.ecosystem = action.payload?.data;
            })
            .addCase(setTokenFirebase.rejected, (state, action) => {
                state.tokenFirebase = "";
            })
            .addMatcher(isFulfilled(getSystem), (state, action) => {
                return {
                    ...state,
                    getConfigDone: true,
                    freeSummaryCount: state.config.free_credit_of_ads === -1 ? action.payload.free_credit_of_ads : state.freeSummaryCount,
                    config: {
                        ...state.config,
                        ...action.payload
                    },
                    listNativeAdsId: action.payload?.key_native_ads?.split("#"),
                    bannerAdsId: action.payload?.key_banner_ads?.split("#")?.[0],
                    nativeAdsId: action.payload?.key_native_ads?.split("#")?.[0],
                    rewardAdsId: action.payload?.key_reward_ads?.split("#")?.[0],
                    openAdsId: action.payload?.key_open_ads?.split("#")?.[0],
                };
            })
    },
});

export const {
    switchTheme,
    setLanguage,
    setIsConnectedInternet,
    setRatingApp,
    setSizeText,
    setFirstInstall,
    setIsPremiumTrial,
    resetIsPremiumTrial,
    setSubscriptionIds,
    setIsPressRate,
    setFreeSummaryCount,
    setLanguageVoice,
    setFreeVoice,
    setSubscriptionsLocal,
    switchEnableSpeech,
    setSuggestQuestion,
    setSpeedSSEMessage,
    setGenderVoice,
    setEnableSpeech,
    setIsPremium,
    setSystem,
    switchAdsId,
    setFreeGiftCount,
    setLastChoiceCountry,
    setFontName,
    setUseNormalSummary,
    setStateToImpression,
    setShouldShowWelcome,
    setEcosystemConfig,
    setDataEcosystemAdmob
} = System.actions;

// Reducer
export default System.reducer;
