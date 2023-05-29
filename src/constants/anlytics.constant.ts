export enum EnumAnalyticEvent {
  PressLogin = "user_press_login",
  LoginSuccess = "user_login_success",
  PressWithoutLogin = "user_press_without_login",
  WithoutLoginSuccess = "user_without_login_success",
  ImpressionAdsCountry = "user_impression_ads_country",
  PressAdsCountry = "user_press_ads_country",
  ImpressionAdsPrev = "user_impression_ads_prev",
  PressAdsPrev = "user_press_ads_prev",
  ImpressionAdsIn = "user_impression_ads_in",
  PressAdsIn = "user_press_ads_in",
  ImpressionAdsAfter = "user_impression_ads_after",
  PressAdsAfter = "user_press_ads_after",
  UnlockOverWords = "user_unlock_over_words",
  UnlockChangeTheme = "user_unlock_change_theme",
  UnlockCleanChat = "user_unlock_clean_chat",
  UnlockRenameChat = "user_unlock_rename_chat",
  UnlockChangeModel = "user_unlock_change_model",
  ChangeTheme = "user_change_theme",
  CreateNewChat = "user_create_new_chat",
  CheckoutPurchases = "user_checkout_purchases",
  Purchased = "user_purchased",
  TrialPremium = "user_trial_premium",
  ClearChat = "user_clear_chat",
  CopyChat = "user_copy_chat",
  SendChat = "user_send_chat",
  Loading = "user_loading",
  PressDiscover = "user_press_discover",

  NativeAdsImpression = "native_impression_",
  NativeAdsOpened = "native_opened_",
  NativeAdsLeftApplication = "native_left_application_",
  NativeAdsClicked = "native_clicked_",
  NativeAdsClosed = "native_closed_",
  NativeAdsLoaded = "native_loaded_",
  onNativeAdsLoaded = "on_native_loaded_",
  NativeAdsFailedToLoad = "native_failed_to_load_",


  OpenAdsImpression = "open_impression",
  OpenAdsShowFail = "open_show_fail",
  OpenAdsLoadFail = "open_load_fail",
  OpenAdsShow = "open_show",

  RewardAdsImpression = "reward_impression",
  RewardAdsShowFail = "reward_show_fail",
  RewardAdsCallShow = "reward_call_show",
  RewardAdsShow = "reward_show",
  RewardAdsLoadFail = "reward_load_fail",

  SettingFront = "setting_front",
  SettingFrontSize = "setting_front_size",
  SettingSpeed = "setting_speed",
  SettingTheme = "setting_theme",

  PressDonate = "press_donate",
  PressConfirmDonate = "press_confirm_donate",
  PressAddFreeBook = "press_add_free_book",
  PressFindABook = "press_find_a_book",
  PressShare = "press_share",
  PressCopy = "press_copy",
  PressSwitchSummary = "press_switch_summary",
  PressReading = "press_reading",
  PressRateApp = "press_rate_app",
}
