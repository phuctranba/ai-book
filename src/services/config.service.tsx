import axios from "axios/index";
import { APP_URL } from "configs/index";

export async function getConfigSource() {
  try {
    let response = await axios.get<any>(`${APP_URL.APP_AJAX_URL}/config/list/config_ads_v1.1.14`)

    if (response.status === 200 && response.data) {
      return response.data
    }
    return undefined;
  } catch (error) {
    throw new Error("Cannot get config");
  }
}
