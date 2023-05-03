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
    limit?: number;
}

function removeDuplicatesBook(books:TypedBook[]) {
    return books.filter((obj, pos, arr) => {
        return arr.map(mapObj => ((mapObj?.volumeInfo?.title||"")+mapObj?.volumeInfo?.authors?.[0]).toLowerCase()).indexOf(((obj?.volumeInfo?.title||"")+obj?.volumeInfo?.authors?.[0]).toLowerCase()) === pos
    })
}

export async function searchBook({page, search, limit = 20}: TypedSearchBookService): Promise<TypedBook[]> {
    try {
        const EndURL = encodeURI(buildEndUrl({
            q: search,
            startIndex: (page-1) * 20,
            maxResults: limit,
            projection: "lite"
        }));

        let responseAdvisors = await axios.get<{
            items: TypedBook[]
        }>(`https://www.googleapis.com/books/v1/volumes${EndURL}`);

        if (Array.isArray(responseAdvisors.data.items)) {
            return removeDuplicatesBook(responseAdvisors.data.items);
        } else {
            return [];
        }
    } catch (error) {
        console.log(error);
        return [];
    }
}
