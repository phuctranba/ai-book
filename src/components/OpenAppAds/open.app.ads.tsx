import { useAppSelector } from 'configs/store.config';
import { useDisplayAds } from 'helpers/system.helper';
import React, { forwardRef } from 'react';
import AdmobApp from './admob.app';

const OpenAppAds = (_, ref) => {
  const { openAdsId, open_ads } = useDisplayAds()
  const isLoadedConfig = useAppSelector(state => state.control.isLoadedConfig)
  const isPremium = useAppSelector(state => state.system.isPremium)

  if (!isLoadedConfig) {
    return null
  }

  if (!openAdsId) {
    return null
  }

  if (!open_ads) {
    return null
  }

  if(isPremium){
    return null
  }

  return (
    <AdmobApp ref={ref} />
  )
}

export default forwardRef(OpenAppAds);
