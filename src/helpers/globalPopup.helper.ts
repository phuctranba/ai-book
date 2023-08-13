import * as React from 'react';
// import {bindActionCreators} from "redux";
// import {clearAuthAllApp} from "store/user.store.reducer";
// import getStore from "../configs-applovin/store.config";
// import { DropdownAlertType, DropdownAlertViewProps } from 'components/DropdownAlert/dropdownAlert';
import { ActionSheetType } from 'components/ActionSheet/ActionSheetView';
import { TypedAdsRef } from 'components/Ads/ads.reward';
import { TypedAlert } from 'components/Alert/AlertView';
import { DropdownAlertType, DropdownAlertViewProps } from 'components/DropdownAlert/dropdownAlert';
import {TypedRefAdmob} from "components/OpenAppAds/admob.app";
// import { TypedSocket } from '../../Socket';
// import { TypedAlert } from "components/Alert/AlertView";
// import { ActionSheetType } from "components/ActionSheet/ActionSheetView";

export const globalUIRef = React.createRef<any>();
export const globalAlertRef = React.createRef<DropdownAlertType>();
export const alertRef = React.createRef<TypedAlert>();
export const alertAdsRef = React.createRef<TypedAlert>();
export const adsRewardRef = React.createRef<TypedAdsRef>();
export const actionSheetRef = React.createRef<ActionSheetType>();
export const admobGlobalRef = React.createRef<TypedRefAdmob>();
export const modalLoadingRef = React.createRef<any>();
export const giftFirstOpenScreenRef = React.createRef<any>();
export const statusApplicationScreenRef = React.createRef<any>();

export function alert(content: DropdownAlertViewProps) {
  globalAlertRef.current?.show(content)
}

export function showLoading(autoHide: boolean = true) {
  globalUIRef.current?.showLoading(autoHide);
}

export function hideLoading() {
  globalUIRef.current?.hideLoading();
}

export function showRate() {
  globalUIRef.current?.showRate();
}


export function showProgress(content: string, autoHide: boolean = true) {
  globalUIRef.current?.showProgress(content, autoHide);
}

export function hideProgress() {
  globalUIRef.current?.hideProgress();
}

/**
 * For lost internet connection
 */
// export function showPopupNoInternetConnect() {
//   globalUIRef.current?.showPopup({
//     content: ["Your internet connection is lost or unstable. Please check and try again."],
//     rightBtn: {
//       content: "Got it!",
//     },
//     iconPopup: <NoWifiIcon fillColor={RootColor.MainColor} style={{ marginBottom: VS._18 }} width={FontSizes._56}
//       height={FontSizes._56} />
//   });
// }

// export function showPopupRequestLogin() {
//   globalUIRef.current?.showPopup({
//     content: ["Login required!", "You have not logged-in yet, you need to be logged in to do this."],
//     rightBtn: {
//       content: "Login",
//       onPress: () => {
//         actions.logout({ callApi: false });
//       }
//     },
//     leftBtn: {
//       content: "Close",
//     },
//     iconPopup: <UserAuthIcon fillColor={RootColor.MainColor} style={{ marginBottom: VS._18 }} width={FontSizes._56} height={FontSizes._56} />
//   });
// }

// export function showPopupUpdateAndroid() {
//   globalUIRef.current?.showPopup({
//     content: ["The new version is ready.", "We've just upgraded the app to the new version, let's update to the latest version for the best experience"],
//     rightBtn: {
//       content: "Update",
//       onPress: () => {
//         Linking.canOpenURL(`market://details?id=com.taki.tarotapp`).then((result) => {
//           if (result)
//             Linking.openURL(`market://details?id=com.taki.tarotapp`).catch((error) => console.log(error, "nc02mrn3"));
//         })
//       }
//     },
//     leftBtn: {
//       content: "Later",
//     },
//     iconPopup: <UserAuthIcon fillColor={RootColor.MainColor} style={{ marginBottom: VS._18 }} width={FontSizes._56}
//       height={FontSizes._56} />
//   });
// }


// export function showPopupNoPermission() {
//   globalUIRef.current?.showPopup({
//     content: ["Not allow!", "You are not allow to perform this action!"],
//     rightBtn: {
//       content: "Got it!"
//     },
//     iconPopup: <BlockIcon fillColor={RootColor.MainColor} style={{ marginBottom: VS._18 }} width={FontSizes._56}
//       height={FontSizes._56} />
//   });
// }

// /**
//  * Jamviet.com added!
//  */
// export function showPopupRequirePermission() {
//   globalUIRef.current?.showPopup({
//     content: ["Permission require!", "We do not have permission to access your camera, maybe you eject before!"],
//     rightBtn: {
//       content: "Got it!",
//     },
//     iconPopup: <BlockIcon fillColor={RootColor.MainColor} style={{ marginBottom: VS._18 }} width={FontSizes._56}
//       height={FontSizes._56} />
//   });
// }

// export function showPopupRequirePermissionCall() {
//   globalUIRef.current?.showPopup({
//     content: ["Permission require!", "We do not have permission to make call to you, maybe you eject before!"],
//     rightBtn: {
//       content: "Open settings!",
//       onPress: () => {
//         PermissionModule.goToSettingSpecialPermissionMIUI()
//       }
//     },
//     iconPopup: <BlockIcon fillColor={RootColor.MainColor} style={{ marginBottom: VS._18 }} width={FontSizes._56}
//       height={FontSizes._56} />
//   });
// }
