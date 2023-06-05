import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
} from 'react';

import { useAppSelector } from 'configs/store.config';

import AdsRewardAdmob from './reward/ads.reward.admob';
import { useDisplayAds } from 'helpers/system.helper';

export interface TypedAdsRef {
    showAds: (cb: Function, notGoPremium: boolean) => void
}

const AdsRewardComponent = (_, ref: React.Ref<TypedAdsRef>) => {
    const {use_reward_ads, rewardAdsId} = useDisplayAds()
    const rewardRef = useRef<any>()
    const isPremium = useAppSelector(state => state.system.isPremium)

    useImperativeHandle(ref, () => ({
        showAds: (cb) => {
            rewardRef.current?.showAds(cb)
        }
    }), [isPremium, use_reward_ads, rewardAdsId])

    if (isPremium || !rewardAdsId || !use_reward_ads) {
        return null
    }

    return <AdsRewardAdmob ref={rewardRef}/>
}

export default forwardRef(AdsRewardComponent);
