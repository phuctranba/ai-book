import {createAsyncThunk, createSlice, isFulfilled} from "@reduxjs/toolkit";
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
        return null
    },
    {serializeError: serializeAxiosError}
);

export const reloadAdsFail = createAsyncThunk(
    "nativeAds/reloadAdsFail",
    async ({key, nativeAdsIndex}: { key: string, nativeAdsIndex: number }) => {
        return null
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
