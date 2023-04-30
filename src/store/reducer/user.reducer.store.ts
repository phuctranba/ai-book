import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, isFulfilled, isRejected } from "@reduxjs/toolkit";
import axios from "axios";
import { APP_URL } from "configs/index";
import { serializeAxiosError } from "configs/reducer.config";
import { getFCMToken } from "helpers/firebase.helper";
import { cleanEntity } from "helpers/object.helper";
import { clearDB } from "helpers/sqlite.helper";
import { TypedFriend, TypedLocation, TypedLoginWithGoogleAccount, TypedPlan, TypedSubscribe, TypedTransaction, TypedUser, TypedUserAnonymous, TypedUserPlaces } from "models/user.model";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { clearListChat, getListGroup } from "./home.reducer.store";
import { resetIsPremiumTrial } from "./system.reducer.store";

/**
 * Jamviet.com refactor. Add updating state...
 */
interface InitialState {
  isAuthenticated: boolean
  account: TypedUser
  listPlan: TypedPlan[]
  listTransactions: TypedTransaction[]
  errorMessage: string | null
  listFriends: TypedFriend[]
  listSubscribe: TypedSubscribe[]
  userPlaces: TypedUserPlaces[]
  userLocations: any,
  listPositionPending: TypedLocation[]
  accountAnonymous?: TypedUserAnonymous,
}

export const initialState: InitialState = {
  isAuthenticated: false,
  account: {},
  listPlan: [],
  listTransactions: [],
  errorMessage: null,
  listFriends: [],
  listSubscribe: [],
  userPlaces: [],
  userLocations: null,
  listPositionPending: [],
  accountAnonymous: undefined
};

/**
 * JamDev: getCurrentUser
 */
export const getCurrentUser = createAsyncThunk("user/getcurrentuser", async (id: string, thunkAPI) => {
  const requestUrl = `${APP_URL.APP_AJAX_URL}/user/detail/${id}`;
  const res = await axios.get<TypedUser>(requestUrl);
  // thunkAPI.dispatch(getListSubscribe({ id }))
  // thunkAPI.dispatch(getListTransactions(id));
  return res;
});

export const createUserAnonymous = createAsyncThunk(
  "user/createUserAnonymous",
  async (language:string) => {
    const data = {
      device_id: await DeviceInfo.getUniqueId(),
      language: language,
      device_signature: await getFCMToken()
    }
    return await axios.post<TypedUserAnonymous>(`${APP_URL.APP_AJAX_URL}/user/anonymous/user-anonymous`, cleanEntity(data));
  },
  { serializeError: serializeAxiosError }
);

export const getListSubscribe = createAsyncThunk(
  "user/getListSubscribe",
  async ({ id, page = 1 }: { id: string, page?: number }) => {
    const responseData = await axios.get<TypedSubscribe[]>(`${APP_URL.APP_AJAX_URL}/subscribe/user/${id}?page=${page}&limit=20`);
    return responseData
  },
  { serializeError: serializeAxiosError }
);

export const removeUser = createAsyncThunk(
  "user/removeUser",
  async ({ id }: { id: string }) => {
    const responseData = await axios.delete(`${APP_URL.APP_AJAX_URL}/user/delete/${id}`)
    return responseData
  },
  { serializeError: serializeAxiosError }
);

export const getListPlan = createAsyncThunk("user/getlistplan", async (_, thunkAPI) => {
  const requestUrl = `${APP_URL.APP_AJAX_URL}/plan/list-plan`;
  return axios.get<TypedPlan[]>(requestUrl);
});

/**
 * JamDev: Logout
 */
export const logout = createAsyncThunk("user/logout", async ({ callApi = true }: { callApi?: boolean }, thunkAPI) => {
  try {
    if (callApi) {
      const requestUrl = `${APP_URL.APP_AJAX_URL}/user/logout`;
      // thunkAPI.dispatch(resetNotification());
      await axios.get(requestUrl);
    }
    thunkAPI.dispatch(resetIsPremiumTrial())
    thunkAPI.dispatch(clearListChat())
    await AsyncStorage.clear()
    await clearDB();
  } catch (e) {

  }

  return;
});


/**
 * JamDev: Login with google
 */

export const loginWithGoogleAccount = createAsyncThunk(
  "user/login/google",
  async (entity: TypedLoginWithGoogleAccount, thunkAPI) => {
    entity.device_uuid = await DeviceInfo.getUniqueId();
    entity.device_signature = await getFCMToken();
    entity.device_type = Platform.OS;
    const res = await axios.post<TypedUser>(`${APP_URL.APP_AJAX_URL}/user/login/google`, cleanEntity(entity));
    return res
  },
  { serializeError: serializeAxiosError }
);

export const loginWithAppleAccount = createAsyncThunk(
  "user/login/apple",
  async (entity: any, thunkAPI) => {
    entity.device_uuid = await DeviceInfo.getUniqueId();
    entity.device_signature = await getFCMToken();
    entity.device_type = Platform.OS;
    const res = await axios.post<TypedUser>(`${APP_URL.APP_AJAX_URL}/user/login/apple`, cleanEntity(entity));
    return res
  },
  { serializeError: serializeAxiosError }
);

export const updateNotificationStatus = createAsyncThunk(
  "user/update_notification_status",
  async (entity: TypedUser) => {
    const data = {
      _id: entity._id,
      notification_status: entity.notification_status
    };
    return await axios.patch<TypedUser>(`${APP_URL.APP_AJAX_URL}/user/update/user`, data);
  },
  { serializeError: serializeAxiosError }
);

export const updateDisableAccount = createAsyncThunk(
  "user/update_disable_account",
  async (entity: TypedUser) => {
    const data = {
      user_id: entity._id,
      disable_account: entity.disable_account
    };
    return await axios.patch<TypedUser>(`${APP_URL.APP_AJAX_URL}/user/update/user-option`, data);
  },
  { serializeError: serializeAxiosError }
);

export const updateMessageStranger = createAsyncThunk(
  "user/update_message_stranger",
  async (entity: TypedUser) => {
    const data = {
      _id: entity._id,
      message_stranger: entity.message_stranger
    };
    return await axios.patch<TypedUser>(`${APP_URL.APP_AJAX_URL}/user/update/user`, data);
  },
  { serializeError: serializeAxiosError }
);


export const checkVerifyAccount = createAsyncThunk(
  "user/checkVerifyAccount",
  async () => {
    return await axios.get<TypedUser>(`${APP_URL.APP_AJAX_URL}/face-detection/total-today`);
  },
  { serializeError: serializeAxiosError }
);

/**
 * get all transaction of user
 */
export const getListTransactions = createAsyncThunk(
  "user/getListTransactions",
  async (id: string) => {
    const responseData = await axios.get<TypedTransaction[]>(`${APP_URL.APP_AJAX_URL}/subscribe/user/${id}`);
    return responseData
  },
  { serializeError: serializeAxiosError }
);

export const inappPurchaseGoogle = createAsyncThunk(
  "user/inappPurchaseGoogle",
  async (data: any, thunkAPI) => {
    const responseData = await axios.post(`${APP_URL.APP_AJAX_URL}/purchase/google`, data);
    return responseData
  },
  { serializeError: serializeAxiosError }
);

export const inappPurchaseApple = createAsyncThunk(
  "user/inappPurchaseApple",
  async (data: any, thunkAPI) => {
    const responseData = await axios.post(`${APP_URL.APP_AJAX_URL}/purchase/apple`, data);
    return responseData
  },
  { serializeError: serializeAxiosError }
);

export const createOrderPackage = createAsyncThunk(
  "user/createOrderPackage",
  async (data: { plan_id: string, amount_of_package: string, payment_method: string }, thunkAPI) => {
    const responseData = await axios.post(`${APP_URL.APP_AJAX_URL}/order/create`, data);
    return responseData
  },
  { serializeError: serializeAxiosError }
);

export const getListFollower = createAsyncThunk(
  "user/getListFollower",
  async ({ page = 1, limit = 20 }: { page?: number, limit?: number }, thunkAPI) => {
    const responseData = await axios.get(`${APP_URL.APP_AJAX_URL}/user/list/followers?page=${page}&limit=${limit}&order_by=DESC`);
    return responseData
  },
  { serializeError: serializeAxiosError }
);

export const getListDisagree = createAsyncThunk(
  "user/getListDisagree",
  async ({ page = 1, limit = 20 }: { page?: number, limit?: number }, thunkAPI) => {
    const responseData = await axios.get(`${APP_URL.APP_AJAX_URL}/user/list/disagree?page=${page}&limit=${limit}&order_by=DESC`);
    return responseData
  },
  { serializeError: serializeAxiosError }
);

export const createUserLocation = createAsyncThunk(
  "user/createUserLocation",
  async (data: { latitude: number, longitude: number, low_power_mode?: string, speed?: string, battery?: string }, thunkAPI) => {
    const responseData = await axios.post(`${APP_URL.APP_AJAX_URL}/user/create/user-location`, data);
    return responseData
  },
  { serializeError: serializeAxiosError }
);

export const getUserLocations = createAsyncThunk(
  "user/getUserLocations",
  async (data: { user_id: string, from?: string, to?: string }, thunkAPI) => {
    const responseData = await axios.get(`${APP_URL.APP_AJAX_URL}/user/list/user-location?user_id=${data.user_id}${data.from ? `&from=${data.from}` : ""}${data.to ? `&to=${data.to}` : ""}`);
    return responseData
  },
  { serializeError: serializeAxiosError }
);

export const disagreeUser = createAsyncThunk(
  "nearby/disagreeUser",
  async (dataFilterUser: { partner_id: string }) => {
    return await axios.post(`${APP_URL.APP_AJAX_URL}/user/disagree`, dataFilterUser);
  },
  { serializeError: serializeAxiosError }
);

export const followUser = createAsyncThunk(
  "nearby/followUser",
  async (dataFilterUser: { partner_id: string }) => {
    return await axios.post(`${APP_URL.APP_AJAX_URL}/user/follow`, dataFilterUser);
  },
  { serializeError: serializeAxiosError }
);

export const updateProfileUser = createAsyncThunk(
  "user/updateProfileUser",
  async (params: { _id: string, display_name?: string, user_avatar?: string, user_avatar_thumbnail?: string }) => {
    return await axios.patch<TypedUser>(`${APP_URL.APP_AJAX_URL}/user/update/user`, params);
  },
  { serializeError: serializeAxiosError }
);

export const updateProfileOptions = createAsyncThunk(
  "user/updateProfileOptions",
  async (params: { user_id: string, user_birthday?: string, user_phone?: string }) => {
    return axios.patch<TypedUser>(`${APP_URL.APP_AJAX_URL}/user/update/user-option`, params);
  },
  { serializeError: serializeAxiosError }
);


export const USER = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    clearError: (state) => {
      return {
        ...state,
        errorMessage: null,
      };
    },
    addUserPlaces: (state, action) => {
      return {
        ...state,
        userPlaces: action.payload.key !== "normal" ? state.userPlaces.find(i => i.key == action.payload.key) ? state.userPlaces.map(i => i.key == action.payload.key ? action.payload : i) : state.userPlaces : [action.payload, ...state.userPlaces]
      }
    },
    setIsAuthenticated: (state) => {
      return {
        ...state,
        isAuthenticated: true,
      }
    }
  },

  extraReducers(builder) {
    builder
      .addMatcher(isFulfilled(getListSubscribe), (state, action) => {
        return {
          ...state,
          listSubscribe: action.payload.data,
        };
      })
      .addMatcher(isFulfilled(getListTransactions), (state, action) => {
        return {
          ...state,
          listTransactions: action.payload.data,
          isLoadingListTransactions: false,
        };
      })
      .addMatcher(
        isFulfilled(loginWithGoogleAccount, loginWithAppleAccount),
        (state, action) => {
          return {
            ...state,
            loading: false,
            submitting: false,
            isAuthenticated: true,
            account: action.payload.data
          };
        }
      )
      .addMatcher(isFulfilled(getCurrentUser), (state, action) => {
        return {
          ...state,
          loading: false,
          submitting: false,
          account: {
            ...action.payload.data,
          },
        };
      })
      .addMatcher(isFulfilled(getListPlan), (state, action) => {
        return {
          ...state,
          listPlan: action.payload.data,
        };
      })
      .addMatcher(isFulfilled(updateNotificationStatus), (state, action) => {
        return {
          ...state,
          account: {
            ...state.account,
            notification_status: action.payload.data.notification_status
          }
        };
      })
      .addMatcher(isFulfilled(updateDisableAccount), (state, action) => {
        return {
          ...state,
          account: {
            ...state.account,
            disable_account: action.payload.data.disable_account
          }
        };
      })
      .addMatcher(isFulfilled(updateMessageStranger), (state, action) => {
        return {
          ...state,
          account: {
            ...state.account,
            message_stranger: action.payload.data.message_stranger
          }
        };
      })
      .addMatcher(isRejected(loginWithGoogleAccount, loginWithAppleAccount), (state, action) => {
        /**
         * Login fail, register fail
         */
        return {
          ...state,
          account: {},
          errorMessage: action?.error?.message || "",
        };
      })
      .addMatcher(isRejected(getCurrentUser), (state, action) => {
        /**
         * Login fail, register fail
         */
        return {
          ...state,
          isAuthenticated: false,
          account: {},
        };
      })

      .addMatcher(isFulfilled(logout), (state) => {
        /**
         * Log out ...
         */
        return {
          ...state,
          loading: false,
          isAuthenticated: false,
          account: {},
        };
      })
      .addMatcher(isRejected(logout), (state) => {
        /**
         * Log out ...
         */
        return {
          ...state,
          loading: false,
          isAuthenticated: false,
          account: {},
        };
      })
      .addMatcher(isFulfilled(getUserLocations), (state, action) => {
        const dataUniq = action.payload.data.reduce((list, current) => {
          if (list.find(i => i.latitude == current.latitude && i.longitude == current.longitude && i.speed == current.speed)) {
            return list
          }
          return [...list, current]
        }, [])
        return {
          ...state,
          userLocations: dataUniq,
        }
      })
      .addMatcher(isFulfilled(updateProfileUser), (state, action) => {
        return {
          ...state,
          account: {
            ...state.account,
            user_avatar: action.payload.data.user_avatar,
            user_avatar_thumbnail: action.payload.data.user_avatar_thumbnail,
            display_name: action.payload.data.display_name,
          },
        }
      })
      .addMatcher(isFulfilled(updateProfileOptions), (state, action) => {
        return {
          ...state,
          account: {
            ...state.account,
            user_phone: action.payload.data.user_phone,
            user_birthday: action.payload.data.user_birthday,
          },
        }
      })
      .addMatcher(isRejected(createUserLocation), (state) => {
        return {
          ...state,

        }
      })
      .addMatcher(isFulfilled(createUserAnonymous), (state, action) => {
        return {
          ...state,
          accountAnonymous: action.payload.data
        }
      })
  },
});
// Reducer
export const {
  clearError,
  addUserPlaces,
  setIsAuthenticated
} = USER.actions;
export default USER.reducer;
