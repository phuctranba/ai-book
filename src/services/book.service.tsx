import axios from "axios/index";
import {ID_ECOSYSTEM} from "constants/system.constant";
import {buildEndUrl} from "helpers/index";
import {TypedBook} from "models/book.modal";

export async function getEcosystem() {
    let response = await axios.get("https://chat-gpt-api.iceo.tech/api/eco-system/list?page=1&limit=100&order_by=DESC&white_list=" + ID_ECOSYSTEM)

    if (response.status === 200 && response.data) {
        console.log(response.data)
    }
}

export type TypedSearchBookService = {
    page: number;
    search: string;
}

export async function searchBook({page, search}: TypedSearchBookService): Promise<TypedBook[]> {
    try {
        const EndURL = encodeURI(buildEndUrl({
            q: search,
            startIndex: (page-1) * 20,
            maxResults: 20,
            projection: "lite"
        }));

        let responseAdvisors = await axios.get<{
            items: TypedBook[]
        }>(`https://www.googleapis.com/books/v1/volumes${EndURL}`);

        if (Array.isArray(responseAdvisors.data.items)) {
            return responseAdvisors.data.items;
        } else {
            return [];
        }
    } catch (error) {
        console.log(error);
        return [];
    }
}
