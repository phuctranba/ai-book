import {createAsyncThunk, createSlice, isFulfilled} from "@reduxjs/toolkit";
import {AdManager} from "react-native-admob-native-ads";
import {serializeAxiosError} from "configs/reducer.config";

interface InitialState {
    nativeAdsIndex: number,
    reloadAds: boolean
}

const initialState: InitialState = {
    nativeAdsIndex: 0,
    reloadAds: false
};

export const setTokenFirebase = createAsyncThunk(
    "system/setTokenFirebase",
    async (token: string) => {

    },
    {serializeError: serializeAxiosError}
);

export const loadMoreAds = createAsyncThunk(
    "nativeAds/loadMoreAds",
    async ({key, nativeAdsIndex}: { key: string, nativeAdsIndex: number }) => {
        AdManager.unRegisterRepository("nativeAds" + (nativeAdsIndex - 1))
        console.log("Goi load ads "+(nativeAdsIndex+1))
        let result = await AdManager.registerRepository({
            name: "nativeAds" + (nativeAdsIndex + 1),
            adUnitId: key,
            numOfAds: 1,
            adChoicesPlacement: 'bottomRight',
            // nonPersonalizedAdsOnly: true,
            requestNonPersonalizedAdsOnly: true,
            videoOptions: {
                muted: true
            },
            expirationPeriod: 3600000,
            mediationEnabled: false
        })

        if (!result) {
            console.log("Goi load ads1 "+(nativeAdsIndex+1))
            result = await AdManager.registerRepository({
                name: "nativeAds" + (nativeAdsIndex + 1),
                adUnitId: key,
                numOfAds: 1,
                adChoicesPlacement: 'bottomRight',
                // nonPersonalizedAdsOnly: true,
                requestNonPersonalizedAdsOnly: true,
                videoOptions: {
                    muted: true
                },
                expirationPeriod: 3600000,
                mediationEnabled: false
            })
        }

        if (result) {
            return result
        } else {
            throw "Load Fail"
        }
    },
    {serializeError: serializeAxiosError}
);

export const reloadAdsFail = createAsyncThunk(
    "nativeAds/reloadAdsFail",
    async ({key, nativeAdsIndex}: { key: string, nativeAdsIndex: number }) => {
        AdManager.unRegisterRepository("nativeAds" + nativeAdsIndex)
        console.log("Goi load ads "+nativeAdsIndex)
        let result = await AdManager.registerRepository({
            name: "nativeAds" + nativeAdsIndex,
            adUnitId: key,
            numOfAds: 1,
            adChoicesPlacement: 'bottomRight',
            // nonPersonalizedAdsOnly: true,
            requestNonPersonalizedAdsOnly: true,
            videoOptions: {
                muted: true
            },
            expirationPeriod: 3600000,
            mediationEnabled: false
        })

        if (!result) {
            console.log("Goi load ads "+nativeAdsIndex)
            result = await AdManager.registerRepository({
                name: "nativeAds" + nativeAdsIndex,
                adUnitId: key,
                numOfAds: 1,
                adChoicesPlacement: 'bottomRight',
                // nonPersonalizedAdsOnly: true,
                requestNonPersonalizedAdsOnly: true,
                videoOptions: {
                    muted: true
                },
                expirationPeriod: 3600000,
                mediationEnabled: false
            })
        }

        if (result) {
            return result
        } else {
            throw "Load Fail"
        }
    },
    {serializeError: serializeAxiosError}
);

export const NativeAds = createSlice({
    name: "nativeAds",
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addMatcher(isFulfilled(loadMoreAds), (state) => {
                return {
                    ...state,
                    nativeAdsIndex: state.nativeAdsIndex + 1
                };
            })
            .addMatcher(isFulfilled(reloadAdsFail), (state) => {
                return {
                    ...state,
                    reloadAds: !state.reloadAds
                };
            })
    },
});

export const {} = NativeAds.actions;

// Reducer
export default NativeAds.reducer;
