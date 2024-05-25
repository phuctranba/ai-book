import {createAsyncThunk, createSlice, isFulfilled} from "@reduxjs/toolkit";
import axios from "axios";
import {APP_URL, LIST_IMAGE_ROOM_DEFAULT} from "configs/index";
import {serializeAxiosError} from "configs/reducer.config";
import {CHATGPT_TOKEN} from "constants/system.constant";
import {cleanEntity} from "helpers/object.helper";
import {deleteDataTable, TABLE_CHAT_ROOM} from "helpers/sqlite.helper";
import {TypeDataCreateChatRoom, TypedChatHistory, TypedGeneralRoomChat} from "models/chat.model";

interface InitialState {
    detailRoom: TypedGeneralRoomChat | null,
    listQuestion: any[],
    currentQuestion: string,
    listChat: TypedGeneralRoomChat[],
    page: number
}

export const initialState: InitialState = {
    detailRoom: null,
    listQuestion: [],
    currentQuestion: "",
    listChat: [],
    page: 1
};

export const createNewRoom = createAsyncThunk(
    "home/createNewRoom",
    async (dataCreate: TypeDataCreateChatRoom) => {
        return await axios.post<TypedGeneralRoomChat>(`${APP_URL.APP_AJAX_URL}/chat-room/create`, dataCreate);
    },
    {serializeError: serializeAxiosError}
);

export const getListGroup = createAsyncThunk(
    "home/getListGroup",
    async ({page = 1}: { page?: number }, thunkAPI) => {
        const res = await axios.get<TypedGeneralRoomChat[]>(`${APP_URL.APP_AJAX_URL}/chat-room/list?page=${page}&limit=20&room_type=group`);

        // if (res.data?.length == 0 && page == 1) {
        //     thunkAPI.dispatch(createNewRoom({
        //         partner_id: [CHATGPT_ID, ADMIN_ID].join(","),
        //         chat_type: "group",
        //         room_name: "New Chat"
        //     }))
        // }
        return {...res, page: page};
    },
    {serializeError: serializeAxiosError}
);

export const setNameOfChatRoom = createAsyncThunk(
    "home/setNameOfChatRoom",
    async ({
               contentFirstValue,
               tokenGPT,
               roomId,
               isAuthenticated,
               clientId
           }: { contentFirstValue: string, tokenGPT: string, roomId: string, isAuthenticated: boolean, clientId: string }, thunkAPI) => {
        let data = {
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": contentFirstValue}]
        }

        let responseName = await axios.post(`https://best-suggest.net/api/gpt/chat/completions`, data, {
            headers: {
                Authorization: `Bearer ${tokenGPT}`,
                "Content-Type": "application/json",
            }
        });

        if (Array.isArray(responseName.data?.choices) && responseName.data?.choices.length > 0) {
            thunkAPI.dispatch(setAvatarOfChatRoom({
                roomId,
                room_name: responseName.data?.choices[0].message.content,
                isAuthenticated,
                clientId
            }))
            if (isAuthenticated) {
                thunkAPI.dispatch(updateRoom({_id: roomId, room_name: responseName.data?.choices[0].message.content}))
            } else {
                thunkAPI.dispatch(setNameDetailRoom({
                    _id: roomId,
                    room_name: responseName.data?.choices[0].message.content
                }))
            }

        }
    },
    {serializeError: serializeAxiosError}
);

export const setAvatarOfChatRoom = createAsyncThunk(
    "home/setAvatarOfChatRoom",
    async ({
               roomId,
               room_name = "",
               clientId,
               isAuthenticated
           }: { room_name: string, clientId: string, roomId: string, isAuthenticated: boolean }, thunkAPI) => {
        try {
            let responseName = await axios.get(`https://api.unsplash.com/search/photos?page=1&per_page=1&query=${room_name}&client_id=${clientId}`);
            console.log("response", responseName);

            if (responseName.data?.results?.[0]?.urls?.thumb) {
                if (isAuthenticated) {
                    thunkAPI.dispatch(updateRoom({
                        _id: roomId,
                        room_thumb: responseName.data?.results?.[0]?.urls?.thumb
                    }))
                } else {
                    thunkAPI.dispatch(setNameDetailRoom({
                        _id: roomId,
                        room_thumb: responseName.data?.results[0].urls.thumb
                    }))
                }
            } else {
                const randomIndex = Math.floor(Math.random() * LIST_IMAGE_ROOM_DEFAULT.length)
                if (isAuthenticated) {
                    thunkAPI.dispatch(updateRoom({_id: roomId, room_thumb: LIST_IMAGE_ROOM_DEFAULT[randomIndex]}))
                } else {
                    thunkAPI.dispatch(setNameDetailRoom({
                        _id: roomId,
                        room_thumb: LIST_IMAGE_ROOM_DEFAULT[randomIndex]
                    }))
                }
            }
        } catch (error) {
            const randomIndex = Math.floor(Math.random() * LIST_IMAGE_ROOM_DEFAULT.length)
            if (isAuthenticated) {
                thunkAPI.dispatch(updateRoom({_id: roomId, room_thumb: LIST_IMAGE_ROOM_DEFAULT[randomIndex]}))
            } else {
                thunkAPI.dispatch(setNameDetailRoom({_id: roomId, room_thumb: LIST_IMAGE_ROOM_DEFAULT[randomIndex]}))
            }
        }
    },
    {serializeError: serializeAxiosError}
);


export const deleteUserRoom = createAsyncThunk(
    "home/deleteUserRoom",
    async (id: string, thunkApi) => {
        const res = await axios.delete(`${APP_URL.APP_AJAX_URL}/chat-room/delete-room/${id}`);
        return res;
    },
    {serializeError: serializeAxiosError}
);

export const leaveGroup = createAsyncThunk(
    "home/leaveGroup",
    async (data: { user_id: string; chat_room_id: string }) => {
        const res = await axios.delete(`${APP_URL.APP_AJAX_URL}/chat-room/user-role`, {data});
        deleteDataTable(`${TABLE_CHAT_ROOM}_${data.chat_room_id}`);
        return {...res, chat_room_id: data.chat_room_id};
    },
    {serializeError: serializeAxiosError}
);
export const updateRoom = createAsyncThunk(
    "home/updateRoom",
    async (data: { _id: string, room_name?: string, room_thumb?: string }) => {
        return await axios.patch<any>(`${APP_URL.APP_AJAX_URL}/chat-room/update-room`, cleanEntity(data));
    },
    {serializeError: serializeAxiosError}
);

export const sendMessage = createAsyncThunk(
    "home/sendMessage",
    async (objectCreateChatHistory: TypedChatHistory, thunkApi) => {
        //Clear attribute server don't need
        const newData = {...objectCreateChatHistory}
        delete newData._id;
        delete newData.send_at;
        delete newData.chat_status;
        delete newData.message_type;
        delete newData.createBy;
        const response = await axios.post(
            `${APP_URL.APP_AJAX_URL}/chat-history/create`,
            cleanEntity(newData)
        );
        return response
    },
    {serializeError: serializeAxiosError}
);

export const sendMessageFromChatGPT = createAsyncThunk(
    "home/sendMessageFromChatGPT",
    async (objectCreateChatHistory: TypedChatHistory, thunkApi) => {
        //Clear attribute server don't need
        const newData = {...objectCreateChatHistory}
        delete newData.local_data_media;
        delete newData.send_at;
        delete newData.chat_status;
        delete newData.message_type;
        delete newData.createBy;
        const response = await axios.post(
            `${APP_URL.APP_AJAX_URL}/chat-history/create`,
            cleanEntity(newData),
            {
                headers: {
                    "x-authorization": CHATGPT_TOKEN,
                    "Authorization": "Bearer " + CHATGPT_TOKEN
                }
            }
        );
        return response
    },
    {serializeError: serializeAxiosError}
);

export const uploadMedia = createAsyncThunk(
    "home/uploadMedia",
    async (file: any) => {
        const newForm = new FormData()
        newForm.append("file[]", file)
        const responseData = await axios.post(APP_URL.APP_UPLOAD_MEDIA, newForm, {headers: {'Content-Type': 'multipart/form-data'}});
        return responseData
    },
    {serializeError: serializeAxiosError}
);

export const questionToChatGPT = createAsyncThunk(
    "home/questionToChatGPT",
    async (data: any) => {
        const newData = {...data}
        delete newData._id
        delete newData.key
        const response = await axios.post(
            `https://best-suggest.net/api/gpt/chat/completions`,
            newData,
            {
                headers: {
                    Authorization: `Bearer ${data.key}`,
                    "Content-Type": "application/json",
                }
            }
        );
        return {...response, data: {...response.data, _id: data._id}}
    },
    {serializeError: serializeAxiosError}
);


export const home = createSlice({
    name: "home",
    initialState: initialState,
    reducers: {
        setCurrentQuestion: (state, action) => {
            return {
                ...state,
                currentQuestion: action.payload,
                listQuestion: []
            };
        },
        setDetailRoom: (state, action) => {
            return {
                ...state,
                detailRoom: action.payload,
                listQuestion: []
            };
        },
        setNameDetailRoom: (state, action) => {
            return {
                ...state,
                detailRoom: state.detailRoom && state.detailRoom?.chat_room_id?._id == action.payload?._id ? {
                    ...state.detailRoom,
                    chat_room_id: {
                        ...state?.detailRoom?.chat_room_id,
                        ...action.payload
                    }
                } : null,
                listChat: state.detailRoom ? state.listChat.map(i =>
                    i?.chat_room_id?._id == action.payload?._id
                        ? {
                            ...i,
                            chat_room_id: {
                                ...i.chat_room_id,
                                ...action.payload
                            }
                        }
                        : i
                ) : state.listChat,
            };
        },
        setLastMessageListRoom: (state, action) => {
            return {
                ...state,
                listChat: state.listChat.map(i =>
                    i?.chat_room_id?._id == state.detailRoom?.chat_room_id?._id
                        ? {
                            ...i,
                            chat_room_id: {
                                ...i.chat_room_id,
                                last_message: action.payload
                            }
                        }
                        : i
                )
            }
        },
        setListQuestion: (state, action) => {
            return {
                ...state,
                listQuestion: action.payload,
            };
        },
        clearListChat: (state) => {
            return {
                ...state,
                listQuestion: [],
                currentQuestion: "",
                listChat: [],
                detailRoom: null
            };
        },
        addNewRoomLocal: (state, action) => {
            return {
                ...state,
                listChat: [action.payload, ...state.listChat]
            };
        },
        deleteRoomLocal: (state, action) => {
            return {
                ...state,
                listChat: state.listChat.filter(item => item.chat_room_id?._id != action.payload)
            };
        }
    },
    extraReducers(builder) {
        builder
            .addMatcher(isFulfilled(createNewRoom), (state, action) => {
                return {
                    ...state,
                    detailRoom: action.payload.data,
                    listChat: [action.payload.data, ...state.listChat]
                }
            })
            // @ts-ignore
            .addMatcher(isFulfilled(updateRoom), (state, action) => {
                let newChatRoom = {
                    ...state.detailRoom,
                    chat_room_id: action.payload.data
                }

                return {
                    ...state,
                    detailRoom: newChatRoom,
                    listChat: state.listChat.map(i => i.chat_room_id?._id == action.payload.data?._id ? {
                        ...i,
                        chat_room_id: {
                            ...i.chat_room_id,
                            room_name: action.payload.data.room_name,
                            last_message: action.payload.data.last_message,
                            room_thumb: action.payload.data.room_thumb
                        }
                    } : i)
                }
            })
            .addMatcher(isFulfilled(leaveGroup), (state, action) => {
                return {
                    ...state,
                    listChat: state.listChat.filter((i) => i.chat_room_id._id !== action.payload?.chat_room_id)
                };
            })
            .addMatcher(isFulfilled(questionToChatGPT), (state, action) => {
                if (action.payload.data._id == state.currentQuestion) {
                    const stringList = action.payload.data?.choices?.[0]?.message?.content || "";
                    const arr = stringList.split('\n');
                    const regex = /^[0-9]\./;
                    const list = arr.filter(i => regex.test(i))
                    return {
                        ...state,
                        listQuestion: list
                    }
                }

                return {
                    ...state,
                    listQuestion: []
                }
            })
            .addMatcher(isFulfilled(getListGroup), (state, action) => {
                if (action.payload.page == 1) {
                    return {
                        ...state,
                        page: 1,
                        listChat: action.payload.data,
                    };
                }

                const newData = [...state.listChat, ...action.payload.data].reduce((list: TypedGeneralRoomChat[], current) => {
                    return list.find((i) => i.chat_room_id._id == current.chat_room_id._id) ? list : [...list, current];
                }, []);

                return {
                    ...state,
                    listChat: newData,
                    page: action.payload.data.length > 0 ? action.payload.page : action.payload.page - 1,
                };
            })
    },
});

// Reducer
export const {
    setCurrentQuestion,
    setDetailRoom,
    setListQuestion,
    clearListChat,
    setNameDetailRoom,
    addNewRoomLocal,
    setLastMessageListRoom,
    deleteRoomLocal
} = home.actions;
export default home.reducer;
