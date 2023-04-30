export interface TypedEcosystem {
    id: string,
    color: string,
    name: string,
    des: object,
    feature: string[],
    logo: string,
    link: {
        android: string,
        ios: string
    },
    deeplink: string
}
