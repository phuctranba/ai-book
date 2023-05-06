import { Platform } from "react-native";

export enum ENV {
  PRODUCTION = "production",
  DEVELOPMENT = "development"
}

/**
 *
 *
 * Thay đổi khi build or dev
 *
 *
 */


export const ENVIRONMENT: ENV = __DEV__ ? ENV.DEVELOPMENT : ENV.PRODUCTION

/**
<<<<<<< src/configs/index.ts
 * Domain cho dev
 */
const DEVELOPER_DOMAIN = "https://chat-gpt-api.iceo.tech";
const DEVELOPER_DOMAIN_MEDIA = "https://media.lgbt.appuni.io";
const DEVELOPER_DOMAIN_API = DEVELOPER_DOMAIN + "/api";
const DEVELOPER_DOMAIN_CHAT = "https://chat-gpt-api.iceo.tech";
const DEVELOPER_DOMAIN_CHAT_API = DEVELOPER_DOMAIN_CHAT + "/api";
const DEVELOPER_DOMAIN_SOCKET = "https://dev-socket.whiteg.app";

/**
 * Domain cho production
 */
const PRODUCTION_DOMAIN = "https://chat-gpt-api.iceo.tech";
const PRODUCTION_DOMAIN_MEDIA = "https://media.lgbt.appuni.io";
const PRODUCTION_DOMAIN_API = PRODUCTION_DOMAIN + "/api";
const PRODUCTION_DOMAIN_CHAT = "https://chat-gpt-api.iceo.tech";
const PRODUCTION_DOMAIN_CHAT_API = PRODUCTION_DOMAIN_CHAT + "/api";
const PRODUCTION_DOMAIN_SOCKET = "https://socket-ishare.whiteg.app/socket";

const INIT_RUNTIME_DOMAIN_MEDIA = ENVIRONMENT === ENV.PRODUCTION ? PRODUCTION_DOMAIN_MEDIA : DEVELOPER_DOMAIN_MEDIA;
const INIT_RUNTIME_DOMAIN_API = ENVIRONMENT === ENV.PRODUCTION ? PRODUCTION_DOMAIN_API : DEVELOPER_DOMAIN_API;
const INIT_RUNTIME_DOMAIN_CHAT = ENVIRONMENT === ENV.PRODUCTION ? PRODUCTION_DOMAIN_CHAT : DEVELOPER_DOMAIN_CHAT;
const INIT_RUNTIME_DOMAIN_SOCKET = ENVIRONMENT === ENV.PRODUCTION ? PRODUCTION_DOMAIN_SOCKET : DEVELOPER_DOMAIN_SOCKET;
const INIT_RUNTIME_DOMAIN_CHAT_API = ENVIRONMENT === ENV.PRODUCTION ? PRODUCTION_DOMAIN_CHAT_API : DEVELOPER_DOMAIN_CHAT_API;

/**
 * Jamviet.com added: Permalink, not depend on environment
 */

export const WEBSITE_FRONTEND = 'https://whiteg.appuni.io/';

export const APP_ID_IOS = "6446157680"
export const WEB_CLIENT_ID_GOOGLE = "6838829297-4q388tv32fq0qte68am225d82pmj3mu1.apps.googleusercontent.com"
export const IOS_CLIENT_ID_GOOGLE = "6838829297-8ltlh9cp1gr3ojr0ll6ufs58fu5klohn.apps.googleusercontent.com"
export const WEATHER_API_KEY = "66fad97f3f5ac3fe64089b2c26e41069"

export const LIST_IMAGE_ROOM_DEFAULT = ["https://media.whiteg.app/icon-gpt/acorn.png", "https://media.whiteg.app/icon-gpt/apple.png", "https://media.whiteg.app/icon-gpt/bear-paw.png", "https://media.whiteg.app/icon-gpt/bear.png", "https://media.whiteg.app/icon-gpt/bee.png", "https://media.whiteg.app/icon-gpt/butterfly.png", "https://media.whiteg.app/icon-gpt/cactus.png", "https://media.whiteg.app/icon-gpt/cockroach.png", "https://media.whiteg.app/icon-gpt/cocoon.png", "https://media.whiteg.app/icon-gpt/crab.png", "https://media.whiteg.app/icon-gpt/deer.png", "https://media.whiteg.app/icon-gpt/dragonfly.png", "https://media.whiteg.app/icon-gpt/eggs.png", "https://media.whiteg.app/icon-gpt/elephant.png", "https://media.whiteg.app/icon-gpt/firefly.png", "https://media.whiteg.app/icon-gpt/fish.png", "https://media.whiteg.app/icon-gpt/flower%20(1).png", "https://media.whiteg.app/icon-gpt/flower.png", "https://media.whiteg.app/icon-gpt/forest.png", "https://media.whiteg.app/icon-gpt/frog.png", "https://media.whiteg.app/icon-gpt/giraffe.png", "https://media.whiteg.app/icon-gpt/grass.png", "https://media.whiteg.app/icon-gpt/hippo.png", "https://media.whiteg.app/icon-gpt/honey.png", "https://media.whiteg.app/icon-gpt/horse.png", "https://media.whiteg.app/icon-gpt/jellyfish.png", "https://media.whiteg.app/icon-gpt/kangaroo.png", "https://media.whiteg.app/icon-gpt/koala.png", "https://media.whiteg.app/icon-gpt/ladybug.png", "https://media.whiteg.app/icon-gpt/leaf%20(1).png", "https://media.whiteg.app/icon-gpt/leaf.png", "https://media.whiteg.app/icon-gpt/lion.png", "https://media.whiteg.app/icon-gpt/log.png", "https://media.whiteg.app/icon-gpt/monkey.png", "https://media.whiteg.app/icon-gpt/mountains.png", "https://media.whiteg.app/icon-gpt/mouse.png", "https://media.whiteg.app/icon-gpt/mushroom.png", "https://media.whiteg.app/icon-gpt/panda.png", "https://media.whiteg.app/icon-gpt/penguin.png", "https://media.whiteg.app/icon-gpt/polar-bear.png", "https://media.whiteg.app/icon-gpt/polar.png", "https://media.whiteg.app/icon-gpt/rabbit.png", "https://media.whiteg.app/icon-gpt/spider.png", "https://media.whiteg.app/icon-gpt/squid.png", "https://media.whiteg.app/icon-gpt/starfish.png", "https://media.whiteg.app/icon-gpt/sun.png", "https://media.whiteg.app/icon-gpt/trees.png", "https://media.whiteg.app/icon-gpt/turtle.png", "https://media.whiteg.app/icon-gpt/walrus.png"]


export const ADS_ID  = Platform.select({
  android: "ca-app-pub-4946499125975524/7415911191",
  ios: "ca-app-pub-9764638132493814/3215960701"
}) || ""

export const CHAT_NATIVE_ADS_ID  = Platform.select({
  android: "ca-app-pub-9764638132493814/6297474484",
  ios: "ca-app-pub-9764638132493814/6105902798"
}) || ""

export const ADS_COUNTRY_ID  = Platform.select({
  android: "ca-app-pub-9764638132493814/1480353965",
  ios: "ca-app-pub-9764638132493814/3246514161"
}) || ""

export const ADS_ID_APPLOVIN  = Platform.select({
  android: "4cf9de752dd4014f",
  ios: "e842abc0adda1467"
}) || ""

export const KEY_REWARD_APPLOVIN = Platform.select({
  android: "e0f72a853dba32b4",
  ios: "5d08cd7195a97a90",
}) || ""

export const KEY_OPEN_APPLOVIN = Platform.select({
  android: "1801df1c0c26a42f",
  ios: "47bf27bf5e9aff83",
}) || ""

export const KEY_REWARD_ADS_MOB = Platform.select({
  android: "ca-app-pub-4946499125975524/3662662157",
  ios: "ca-app-pub-9764638132493814/8133756212",
}) || ""

export const KEY_OPEN_ADS_MOB = Platform.select({
  android: "ca-app-pub-4946499125975524/7410335470",
  ios: "ca-app-pub-9764638132493814/3277669296",
}) || ""

export let APP_URL = {
  env: ENVIRONMENT === ENV.PRODUCTION ? 'product' : 'develop', // or production
  APP_API_REQUEST_TIMEOUT: 15, // in second, NOT microseconds
  APP_AJAX_URL: INIT_RUNTIME_DOMAIN_API + '',
  APP_UPLOAD_MEDIA: INIT_RUNTIME_DOMAIN_MEDIA + '/upload-media' + (ENVIRONMENT === ENV.PRODUCTION ? "" : `?callback=${DEVELOPER_DOMAIN}/api/chat-media/create`),
  APP_CHAT_MEDIA: INIT_RUNTIME_DOMAIN_CHAT_API + "/chat-media",
  VUE_APP_URL_CHAT_SOCKET: INIT_RUNTIME_DOMAIN_SOCKET + '/socket',

  APP_CHAT_ROOT: INIT_RUNTIME_DOMAIN_CHAT,
  WEBSITE_FRONTEND: WEBSITE_FRONTEND,
  TERM: "https://lamthien8x.gitbook.io/terms-of-use/",
  POLICIES: "https://lamthien8x.gitbook.io/ai-book/"
}

export function setUrlEnv(isProduction: boolean) {
  const RUNTIME_DOMAIN = isProduction ? PRODUCTION_DOMAIN : DEVELOPER_DOMAIN;
  const RUNTIME_DOMAIN_MEDIA = isProduction ? PRODUCTION_DOMAIN_MEDIA : DEVELOPER_DOMAIN_MEDIA;
  const RUNTIME_DOMAIN_API = isProduction ? PRODUCTION_DOMAIN_API : DEVELOPER_DOMAIN_API;
  const RUNTIME_DOMAIN_CHAT = isProduction ? PRODUCTION_DOMAIN_CHAT : DEVELOPER_DOMAIN_CHAT;
  const RUNTIME_DOMAIN_SOCKET = isProduction ? PRODUCTION_DOMAIN_SOCKET : DEVELOPER_DOMAIN_SOCKET;
  const RUNTIME_DOMAIN_CHAT_API = isProduction ? PRODUCTION_DOMAIN_CHAT_API : DEVELOPER_DOMAIN_CHAT_API;
  APP_URL = {
    env: isProduction ? 'product' : 'develop', // or production
    APP_API_REQUEST_TIMEOUT: 15, // in second, NOT microseconds
    APP_AJAX_URL: RUNTIME_DOMAIN_API + '',
    APP_UPLOAD_MEDIA: RUNTIME_DOMAIN_MEDIA + '/upload-media' + (isProduction ? "" : `?callback=${DEVELOPER_DOMAIN}/api/chat-media/create`),
    APP_CHAT_MEDIA: RUNTIME_DOMAIN_CHAT_API + "/chat-media",
    VUE_APP_URL_CHAT_SOCKET: RUNTIME_DOMAIN_SOCKET + '/socket',

    APP_CHAT_ROOT: RUNTIME_DOMAIN_CHAT,
    WEBSITE_FRONTEND: WEBSITE_FRONTEND,
    TERM: WEBSITE_FRONTEND + "page/terms",
    POLICIES: WEBSITE_FRONTEND + "page/policies"
  }
}
