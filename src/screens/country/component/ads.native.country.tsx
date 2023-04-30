import React, {forwardRef} from 'react';
import AdsNativeAdmob from './ads.native.admob';

interface Props {
    onAdClicked: () => void
    onAdLoadFailed: () => void
}

const AdsNativeCountry = ({onAdClicked, onAdLoadFailed}: Props, ref) => {

    return (
        <AdsNativeAdmob
            ref={ref}
            onAdClicked={onAdClicked}
            onAdLoadFailedProps={onAdLoadFailed}
        />
    )
}


export default forwardRef(AdsNativeCountry);
