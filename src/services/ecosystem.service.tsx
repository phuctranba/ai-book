import axios from "axios/index";
import {ID_ECOSYSTEM} from "constants/system.constant";

export async function getEcosystem() {
    let response = await axios.get("https://chat-gpt-api.iceo.tech/api/eco-system/list?page=1&limit=100&order_by=DESC&white_list=" + ID_ECOSYSTEM)

    if (response.status === 200 && response.data) {
        console.log(response.data)
    }
}
