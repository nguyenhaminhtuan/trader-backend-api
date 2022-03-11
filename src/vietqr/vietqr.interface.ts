export interface VietQRResponse<T> {
  code: string
  desc: string
  data: T
}

export interface GenerateQR {
  qrDataURL: string
  qrCode?: unknown
}

export interface Bank {
  id: number
  name: string
  code: string
  bin: string
  isTransfer: number
  short_name: string
  logo: string
  support: number
}
