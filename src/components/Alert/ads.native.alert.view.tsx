import React, {forwardRef} from 'react';
import AdsNativeAdmob from './component/ads.native.admob';
import {useAppSelector} from "configs/store.config";
import {useDisplayAds} from "helpers/system.helper";

interface Props {
    onAdClicked: () => void
    onAddImpression?: () => void
}

const AdsNativeAlertView = ({onAdClicked, onAddImpression}: Props, ref) => {
    const isLoadedConfig = useAppSelector(state => state.control.isLoadedConfig)
    const isPremium = useAppSelector(state => state.system.isPremium)
    const {native_ads_pre, native_ads_after} = useDisplayAds()

    if (isPremium || !isLoadedConfig || (!native_ads_pre && !native_ads_after))
        return null;

    return (
        <AdsNativeAdmob
            ref={ref}
            onAdClicked={onAdClicked}
            onAddImpression={onAddImpression}
        />
    )
}


export default forwardRef(AdsNativeAlertView);
