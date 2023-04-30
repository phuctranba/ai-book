import axios from "axios";
import { APP_URL } from "configs/index";
import { TypedChatHistory, TypedDetailRoomChat } from "models/chat.model";

export async function prepareDataForRoomChat(detailRoomChat: TypedDetailRoomChat): Promise<TypedChatHistory[] | undefined> {
  try {
    const latestMessageFromServer = await getLatestMessageFromServer(detailRoomChat, undefined)
    return latestMessageFromServer
  } catch (error) {
    console.log(error, "prepareDataForRoomChat")
    throw error
  }
}

export async function getMoreMessageForRoomChat(detailRoomChat: TypedDetailRoomChat, lastMessage: TypedChatHistory): Promise<TypedChatHistory[]> {
  try {
    const listMessageFromServer = await getPreviousMessageFromServer(detailRoomChat, lastMessage);
    return listMessageFromServer.filter((i) => i._id !== lastMessage._id)
  } catch (error) {
    console.log(error, "getMoreMessageForRoomChat")
    throw error
  }
}

export async function getLatestMessageFromServer(detailRoom: TypedDetailRoomChat, lastMessage: TypedChatHistory | undefined): Promise<TypedChatHistory[]> {
  try {
    const messageLatestResponse = await axios.get<TypedChatHistory[]>(`${APP_URL.APP_AJAX_URL}/chat-history/room/${detailRoom._id}?order_by=DESC${lastMessage?._id ? "&from_id=" + lastMessage._id : ""}&limit=20`);
    if (Array.isArray(messageLatestResponse.data))
      return messageLatestResponse.data;
    else
      return [];
  } catch (error) {
    console.warn(error, "syncMessages")
    return []
  }
}

export async function getPreviousMessageFromServer(detailRoom: TypedDetailRoomChat, lastMessage: TypedChatHistory | undefined): Promise<TypedChatHistory[]> {
  try {
    const messageLatestResponse = await axios.get<TypedChatHistory[]>(`${APP_URL.APP_AJAX_URL}/chat-history/room/${detailRoom?._id}?order_by=DESC${lastMessage?._id ? "&to_id=" + lastMessage._id : ""}&limit=20`);
    if (Array.isArray(messageLatestResponse.data))
      return messageLatestResponse.data;
    else
      return [];
  } catch (error) {
    console.warn(error, "syncMessages")
    return []
  }
}