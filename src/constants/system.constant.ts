import {PERMISSIONS} from "react-native-permissions";
import {Device} from "ui/device.ui";
import {Platform} from "react-native"

export const HIT_SLOP_EXPAND_20 = {top: 20, left: 20, right: 20, bottom: 20};
export const HIT_SLOP_EXPAND_10 = {top: 10, left: 10, right: 10, bottom: 10};
export const ADMIN_ID = "640fd0f476d23263d0ccb101"
export const CHATGPT_ID = "640840ad76d23263d0cc7b4b";
export const CHATGPT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDk3OTg0NDUsImRhdGEiOnsiX2lkIjoiNjQwODQwYWQ3NmQyMzI2M2QwY2M3YjRiIiwia2V5IjoiNzdmNzJiNzE3NWE2M2Y2MzkxYzc0M2QyYTIyMTQ4NjIiLCJzaWduYXR1cmUiOiJlOTk2OTkyYzU3N2YyZjQwOWQyMGEwZDYyYTBhZGRlZiIsInNlc3Npb24iOiI2NDA4NDBhZDc2ZDIzMjYzZDBjYzdiNTEifSwiaWF0IjoxNjc4MjYyNDQ1fQ.EpPmDPzlE2RpkVBu7NR2LXPU89owcTlFBDEVn-kvpZY"
export const NUMBER_MESSAGE_BLOCK = 3

export const ID_ECOSYSTEM = "com.iceo.aichat";
export const ID_APP = "ai_book_"
export const STORE_LINK = Device.isAndroid ? "https://play.google.com/store/apps/details?id=com.zipenter.aibook" : "https://play.google.com/store/apps/details?id=com.zipenter.aibook"

export let DATA_ECOSYSTEM_ADS = [
    {
        name:"ai_insurance",
        link:Platform.select({
            android: "https://play.google.com/store/apps/details?id=com.zipenter.aiinsurance",
            default: "https://play.google.com/store/apps/details?id=com.zipenter.aiinsurance"
        }),
        logo: require("assets/images/logo_insurance.png"),
        title:"Insurance Tool - AI Adviser",
        description:"AI-powered app for personalized guidance, policy management, claims assistance",
        image:[
            require("assets/images/insurance1.jpg"),
            require("assets/images/insurance2.jpg"),
            require("assets/images/insurance3.jpg")
        ]
    },
    {
        name:"ai_tax",
        link:Platform.select({
            android: "https://play.google.com/store/apps/details?id=com.zipenter.aitax",
            default: "https://play.google.com/store/apps/details?id=com.zipenter.aitax"
        }),
        logo: require("assets/images/logo_tax.jpg"),
        title:"AI Tax",
        description:"Immediately answer all your question about the tax in the most exact way",
        image:[
            require("assets/images/tax1.jpg"),
            require("assets/images/tax2.jpg"),
            require("assets/images/tax3.jpg")
        ]
    },
    {
        name:"ai_cook",
        link:Platform.select({
            android: "https://play.google.com/store/apps/details?id=com.zipenter.aicook",
            default: "https://play.google.com/store/apps/details?id=com.zipenter.aicook"
        }),
        logo: require("assets/images/logo_cook.png"),
        title:"AI Chef - Cooking Trainer",
        description:"Your Personal AI Sous Chef for Delicious Recipes & Culinary Skills",
        image:[
            require("assets/images/cook1.jpg"),
            require("assets/images/cook2.jpg"),
            require("assets/images/cook3.jpg")
        ]
    },
]

export function updateDataEcosystemAdmob(data:any[]){
    DATA_ECOSYSTEM_ADS = data
}

export function randomAppAds(){
    return DATA_ECOSYSTEM_ADS[Math.floor(Math.random()*DATA_ECOSYSTEM_ADS.length)]
}

export const FONTS = [
    "Raleway",
    "Montserrat",
    "Ysabeau",
    "Labrada",
    "Grandstander",
    "MuseoModerno",
    "Grenze"
]

export const PERMISSION = {
    permissionVideoCall: Device.isIos ?
        [
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.MICROPHONE,
        ]
        :
        [
            PERMISSIONS.ANDROID.CAMERA,
            PERMISSIONS.ANDROID.RECORD_AUDIO,
        ],
    permissionMedia: Device.isIos ?
        [
            PERMISSIONS.IOS.CAMERA,
            PERMISSIONS.IOS.MICROPHONE,
            PERMISSIONS.IOS.PHOTO_LIBRARY
        ]
        :
        Platform.Version >= 33 ? [
                PERMISSIONS.ANDROID.CAMERA,
                PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
                PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
                PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
            ] :
            [
                PERMISSIONS.ANDROID.CAMERA,
                PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
                PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
            ],
    permissionRecord: Device.isIos ?
        [
            PERMISSIONS.IOS.MICROPHONE,
        ]
        :
        Platform.Version >= 33 ? [
                PERMISSIONS.ANDROID.RECORD_AUDIO,
                PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
            ] :
            [
                PERMISSIONS.ANDROID.RECORD_AUDIO,
                PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
                PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
            ],
    permissionLibrary: Device.isIos ?
        [
            PERMISSIONS.IOS.PHOTO_LIBRARY
        ]
        :
        Platform.Version >= 33 ? [
                PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
                PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
            ] :
            [
                PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
                PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
            ],
    permissionCamera: Device.isIos ?
        [
            PERMISSIONS.IOS.CAMERA
        ]
        :
        [
            PERMISSIONS.ANDROID.CAMERA,
        ],
    permissionCall: Device.isIos ?
        []
        :
        [
            PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
            PERMISSIONS.ANDROID.CALL_PHONE
        ],
}

export enum EnumTheme {
    Dark = "Dark",
    Light = "Light"
}

export enum EnumHeightWeightUnit {
    cmkg = "cm/kg",
    ftlb = "ft/lb"
}

export enum EnumDistanceUnit {
    km = "km",
    miles = "mi"
}
