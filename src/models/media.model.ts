export interface TypedCropImage {
  creationDate?: string
  cropRect?: any
  data?: any
  duration?: any
  exif?: any
  filename?: string
  fileName?: string
  height?: number
  localIdentifier?: string
  mime?: string
  modificationDate?: any
  path?: string
  size?: number
  sourceURL?: string
  width?: number
  type?: string
  uri?: string
}

export interface TypedMediaUpload {
  src: string,
  thumbnail: string,
  callback: {
    _id: string,
    media_url: string,
    media_url_presign: string,
    media_type: string,
    media_thumbnail: string,
    media_mime_type: string,
    media_file_name: string,
    chat_history_id: any,
    chat_room_id: any,
    media_status: number,
    media_meta: any[],
    createBy: string,
    createdAt: string,
    updatedAt: string,
  }
}