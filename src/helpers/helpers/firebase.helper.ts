import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import getStore from "configs/store.config";
import { AppState } from "react-native";
import { bindActionCreators } from "redux";
import { setTokenFirebase } from "store/reducer/system.reducer.store";
import notifee from '@notifee/react-native';
import {GlobalPopupHelper} from "helpers/index";
import {RootColor} from "ui/theme";

const store = getStore();
const actions = bindActionCreators({ setTokenFirebase }, store.dispatch);

async function requestUserPermission() {
  try {
    GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
    await notifee.requestPermission()
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  } catch (error) {

  }
}

async function getFCMToken() {
  const fcmToken = await AsyncStorage.getItem("whitegFcmToken");
  if (!fcmToken) {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      if (token) {
        await AsyncStorage.setItem("whitegFcmToken", token);
        return token;
      }
      return "";
    } catch (error) {
      console.log("error fcm token", error);
      return "";
    }
  }
  return fcmToken;
}

const createDefaultChannels = async () => {
  const channelId = await notifee.createChannel({
    id: 'chat_gpt_id',
    name: 'Default Channel',
  });
}

const NotificationHelper = () => {
  messaging().onNotificationOpenedApp(async (remoteMessage) => {
    console.log("Notification caused app to open from background state:", remoteMessage.notification);
  });

  messaging()
    .subscribeToTopic("all")
    .then(() => console.log("Subscribed to topic all!"));

  messaging().onTokenRefresh((newFcmToken: string) => {
    console.log("refreshFCMToken", newFcmToken);

    let isAuth = store.getState()?.user?.isAuthenticated;
    if (isAuth) actions.setTokenFirebase(newFcmToken);
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("Notification caused app to open from quit state:", remoteMessage.notification);
      }
    });

  messaging().onMessage(async (remoteMessage) => {
    console.log("notification from foreground state....", remoteMessage);
    try {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });
      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body || "",
        android: {
          channelId,
          color: RootColor.MainColor,
          smallIcon: 'ic_notification', // optional, defaults to 'ic_launcher'.
          // pressAction is needed if you want the notification to open the app when pressed
        },
      });
    } catch (error) {
      console.log("showlocal noti failed", error);
    }
  });
};

export { requestUserPermission, NotificationHelper, getFCMToken, createDefaultChannels };

