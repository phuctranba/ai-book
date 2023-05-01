import {useAppSelector} from 'configs/store.config';
import {useDisplayAds} from 'helpers/system.helper';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import AdsRewardAdmob from './reward/ads.reward.admob';

export interface TypedAdsRef {
    showAds: (cb: Function) => void
}

const AdsRewardComponent = (_, ref: React.Ref<TypedAdsRef>) => {
    const {reward_ads, rewardAdsId} = useDisplayAds()
    const rewardRef = useRef<any>()
    const isLoadedConfig = useAppSelector(state => state.control.isLoadedConfig)
    const isPremium = useAppSelector(state => state.system.isPremium)

    useImperativeHandle(ref, () => ({
        showAds: (cb) => {
            rewardRef.current?.showAds(cb)
        }
    }), [isLoadedConfig])

    if (!isLoadedConfig) {
        return null
    }


    if (!rewardAdsId) {
        return null
    }

    if (!reward_ads) {
        return null
    }

    if(isPremium){
        return null
    }

    return <AdsRewardAdmob ref={rewardRef}/>
}

export default forwardRef(AdsRewardComponent);
