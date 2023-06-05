import { useAppSelector } from 'configs/store.config';
import React, { forwardRef } from 'react';
import AdmobApp from './admob.app';
import { useDisplayAds } from 'helpers/system.helper';

const OpenAppAds = (_, ref) => {
  const { openAdsId, use_open_ads } = useDisplayAds()
  const isPremium = useAppSelector(state => state.system.isPremium)

  if (isPremium || !openAdsId || !use_open_ads) {
    return null
  }

  return (
      <AdmobApp ref={ref} />
  )
}
export default forwardRef(OpenAppAds);
