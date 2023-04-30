import { GlobalPopupHelper } from "helpers/index";
import { Linking } from 'react-native';
import { checkMultiple, openSettings, Permission, requestMultiple, RESULTS } from 'react-native-permissions';

/**
 *
 * @param listPermission chưa check null ?
 * @returns
 */
export async function requestPermission(listPermission: Permission[]): Promise<string> {
  GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
  return await requestMultiple(listPermission)
    .then((statuses) => {
      let permissionRequestResult: Permission[] = [];
      let isBlocked: boolean = false;
      listPermission.map((item) => {
        if (statuses[item] === RESULTS.DENIED)
          permissionRequestResult.push(item);
        if (statuses[item] === RESULTS.BLOCKED)
          isBlocked = true;
      })

      if (isBlocked) {
        GlobalPopupHelper.alertRef.current?.alert({
          title: "Permission denied",
          message: "We do not have permission, maybe you eject before!",
          actions: [{
            text: "Cancel"
          }, {
            text: "Open Settings",
            onPress: async () => {
              await Linking.openSettings()
            },
            active: true
          }]
        })
        return RESULTS.BLOCKED;
      } else {
        if (permissionRequestResult.length === 0)
          return RESULTS.GRANTED
        else
          return RESULTS.DENIED
      }
    })
    .catch((error) => {
      console.log(error)
      return RESULTS.BLOCKED;
    });
}

export async function checkPermission(listPermission: Permission[]): Promise<string> {
  GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
  return await checkMultiple(listPermission)
    .then((statuses) => {
      let permissionNeedRequest: Permission[] = [];
      let isBlocked: boolean = false;
      listPermission.map((item) => {
        if (statuses[item] === RESULTS.DENIED)
          permissionNeedRequest.push(item);
        if (statuses[item] === RESULTS.BLOCKED)
          isBlocked = true;
      })

      if (isBlocked) {
        return RESULTS.BLOCKED;
      } else {
        if (permissionNeedRequest.length === 0)
          return RESULTS.GRANTED
        else
          return RESULTS.DENIED
      }
    })
    .catch((error) => {
      console.log(error)
      return RESULTS.BLOCKED;
    });
}

/**
 * Jamviet.com check and refactor
 * @param permissionForPlatform
 * @param setIsPermissionGranted
 * @returns
 */
export function grantPermission(permissionForPlatform: Permission[], setIsPermissionGranted?: (value: boolean) => void) {
  GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
  return async (needRequest: boolean = true, needOpenSetting: boolean = true): Promise<boolean> => {
    let checkPermissionResult: string = await checkPermission(permissionForPlatform);
    if (checkPermissionResult === RESULTS.GRANTED) {
      setIsPermissionGranted?.(true);
      return true;
    } else {
      if (checkPermissionResult === RESULTS.DENIED) {
        GlobalPopupHelper.admobGlobalRef.current?.setIgnoreOneTimeAppOpenAd();
        let requestPermissionResult: string = needRequest ? await requestPermission(permissionForPlatform) : checkPermissionResult;
        if (requestPermissionResult === RESULTS.GRANTED) {
          setIsPermissionGranted?.(true);
          return true;
        } else {
          setIsPermissionGranted?.(false);
          return false;
        }
      } else {
        setIsPermissionGranted?.(false);
        if (needOpenSetting)
          openSettings().catch(() => console.log('cannot open settings'));
        return false;
      }
    }
  }
}
