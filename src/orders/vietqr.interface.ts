export interface VietQRGenerateResponse {
  code: string
  desc: string
  data: QRData
}

export interface QRData {
  qrDataURL: string
  qrCode?: unknown
}
