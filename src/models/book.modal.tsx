export interface TypedBook {
    "id"?: string,
    "etag"?: string,
    "volumeInfo"?: {
        "title"?: string,
        "authors"?: string[],
        "publisher"?: string,
        "publishedDate"?: string,
        "description"?: string,
        "imageLinks"?: {
            "thumbnail"?: string
        },
    },
}

export interface TypedBookSummary extends TypedBook{
    dateSummary: string,
    summaryContent: string,
    isNormalSummary: boolean
}
