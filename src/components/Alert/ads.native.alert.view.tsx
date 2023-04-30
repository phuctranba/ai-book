import React, { forwardRef } from 'react';
import AdsNativeAdmob from './component/ads.native.admob';
import AdsNativeAppLovin from './component/ads.native.applovin';
import {useAppSelector} from "configs/store.config";

interface Props {
  onAdClicked: () => void
  onAddImpression?: () => void
}

const AdsNativeAlertView = ({ onAdClicked, onAddImpression }: Props, ref) => {
  const isLoadedConfig = useAppSelector(state => state.control.isLoadedConfig)

  if(!isLoadedConfig)
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
