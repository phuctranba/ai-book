export interface TypedUser {
  _id?: string
  user_phone?: string
  user_address?: string
  user_birthday?: string
  user_birthday_year?: number
  base_height?: number
  base_weight?: number
  base_role?: string
  body_type?: string
  relationship_status?: string
  ethnicity?: string
  language?: string[]
  locking_for?: string[]
  where_to_meet?: string[]
  user_job?: string
  user_department?: string
  user_nation?: string
  user_gender?: string
  hiv_status?: string
  last_test?: any
  safety_practices?: any[]
  loc?: any
  social_link?: { key: string, value: string }[]
  createdAt?: string
  updatedAt?: string
  user_login?: string
  user_avatar?: string
  user_cover?: string
  display_name?: string
  user_role?: string
  bio?: string
  user_referrer?: string
  user_balance?: number
  user_status?: number
  last_active?: string
  user_active?: number
  follow_id?: any
  user_id?: string
  public_album?: any[]
  public_instagram?: any[]
  public_sound?: string
  user_avatar_thumbnail?: string
  map_count?: string
  distance?: number
  match_status?: number
  is_block?: number
  user_number?: number
  travel_city?: string | null,
  instagram_token?: string
  notification_status?: string
  user_interest?: string[]
  circle_point?: number
  is_avatar?: number
  validate_status?: number
  disable_account?: string
  user_mood?: {
    image: string
    text: string
  }
  message_stranger?: string
  country?: string
  user_video?: TypedVideo[]
  video_number?: number
  user_education?: string
  user_religion?: string
  like_alcoholic?: string
  like_tobacco?: string
  have_children?: string
  living_with?: string
  user_question?: any[]
  user_type?: "A" | "B" | "C" | "D",
  last_user_location?: TypedLocation
  is_match?: any
}

export interface TypedVideo {
  caption: string
  comment_number: number
  createdAt: string
  hashtag_id: any[]
  language: string
  like_number: number
  is_like: boolean
  is_view: boolean
  view_number: number
  media_id: {
    chat_history_id: null
    chat_room_id: null
    createBy: string
    createdAt: string
    media_file_name: string
    media_meta: { key: string, value: string }[]
    media_mime_type: string
    media_status: number
    media_thumbnail: string
    media_type: string
    media_url: string
    media_url_presign: string
    updatedAt: string
    _id: string
  }
  music_id: any[]
  short_status: string
  updatedAt: string
  user_id: TypedUser
  _id: string
}

export interface TypedTransaction {
  transaction_id: string;
  transaction_value: number;
  transaction_ref?: string;
  transaction_note?: string;
  transaction_condition: string;
  transaction_current_balance: number;
  transaction_new_balance: number;
  // transaction_method: TRANSACTION_METHOD;
  object_id?: string;
  createAt: string;
  updateAt?: string;
  service_name?: string;
}

export interface TypedPlan {
  amount_of_day: number
  country: string
  createdAt: string
  description: string
  google_store_product_id: string
  handle: string
  handle_id: string
  image: string
  name: string
  price: number
  status: number
  type: string
  updatedAt: string
  version: string
  currency: string
  _id: string
}

export interface TypedLoginWithGoogleAccount {
  user_token: string | null;
  device_uuid?: string;
  device_type?: string;
  device_signature?: string;
}

export interface TypedLocation {
  latitude: number
  longitude: number
  speed: number
  power_state: {
    batteryLevel: number
    batteryState: string // 'unplugged'
    lowPowerMode: boolean
  },
  time: number
  battery?: string
}

export interface TypedFriend {

}

export interface TypedSubscribe {
  transaction_id: string;
  transaction_value: number;
  transaction_ref?: string;
  transaction_note?: string;
  transaction_condition: string;
  transaction_current_balance: number;
  transaction_new_balance: number;
  // transaction_method: TRANSACTION_METHOD;
  object_id?: string;
  createAt: string;
  updateAt?: string;
  service_name?: string;
}

export interface TypedUserPlaces {
  key: string
  name: string
  location: {
    latitude: number
    longitude: number
  }
}

export interface TypedUserAnonymous {
  apple_notification: string
  apple_signature: string
  createdAt: string
  device_id: string
  device_signature: string
  device_type: string
  device_uuid: string
  display_name: string
  language: string
  updatedAt: string
  user_ip: string
  _id: string
}

export interface TypedRefModal{
  show: ()=>void;
  hide: ()=>void;
}
