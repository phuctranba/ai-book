import { useAppSelector } from 'configs/store.config';
import React, { forwardRef } from 'react';
import AdmobApp from './admob.app';
import { useDisplayAds } from 'helpers/system.helper';

const OpenAppAds = (_, ref) => {
  const { openAdsId, use_open_ads } = useDisplayAds()
  const isLoadedConfig = useAppSelector(state => state.control.isLoadedConfig)
  const isPremium = useAppSelector(state => state.system.isPremium)

  if(isPremium){
    return null
  }

  if (!isLoadedConfig) {
    return null
  }

  if (!openAdsId) {
    return null
  }

  if (!use_open_ads) {
    return null
  }



  return (
      <AdmobApp ref={ref} />
  )
}
export default forwardRef(OpenAppAds);
