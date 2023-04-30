import {createSlice} from "@reduxjs/toolkit";

interface InitialState {
    isLoadedConfig: boolean
    showModalRate: boolean
}

const initialState: InitialState = {
    isLoadedConfig: false,
    showModalRate: true
};

export const Control = createSlice({
    name: "control",
    initialState,
    reducers: {
        setLoadedConfig: (state) => {
            state.isLoadedConfig = true;
        },
        setFalseModalRate: (state) => {
            state.showModalRate = false;
        },
    },
    extraReducers(builder) {

    },
});

export const {
    setLoadedConfig,
    setFalseModalRate
} = Control.actions;

// Reducer
export default Control.reducer;
