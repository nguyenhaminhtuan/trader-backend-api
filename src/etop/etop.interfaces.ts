export interface EtopResponse<T = any> {
  code: number
  errors: string
  message: string
  statusCode: number
  type: 'success' | 'error'
  data: T
  datas: T
}

export interface EtopLogin {
  node: string
  token_status: string
  tk: string
  limit: boolean
  steam: string
  main_game: string
  loginmode: number
  account: string
}

export interface EtopBag {
  counts: number
  game: string
  more: boolean
  order: number
  list: EtopItem[]
  pager: {
    current: number
    pages: number
    rp: number
    total: number
  }
  resource: any
  user: {
    steamId: string
    canUseSystem: boolean
    goldingot: number
    frozen_goldingot: number
    bagNum: number
  }
  values: number
}

interface CommonProp {
  color: string
  name: string
  tag: string
}

export interface EtopItem {
  image: string
  type_name: any
  hero: string
  type: any
  imageBottomShow: CommonProp
  quality: CommonProp
  pop: {
    bottom: CommonProp[]
    topName: CommonProp
  }
  show_type: string
  local_image: string
  hero_localname: any
  appid: number
  name: string
  is_custom: boolean
  name_color: string
  id: number
  state: number
  shortName: string
  value: number
  rarity: CommonProp
  status: {
    redlock: number
  }
  locked: boolean
}

export interface EtopGift {
  appid: number
  canUnfreeze: boolean
  createtime: number
  flag: boolean
  friend: string
  friendSteamId: string
  id: string
  items: EtopItem[]
  locktime: number
  nums: number
  remainTime: number
  state: number
  steamId: string
  total: number
  unfreezetime?: number
  unlocktime?: number
  user: string
}

export interface GetEtopGifts {
  list: EtopGift[]
  more: boolean
  order: any
  pager: {
    current: number
    pages: number
    rp: number
    total: number
  }
  resource: any
  user: any
}

export interface UnlockGift {
  ajaxid: any
  callbackType: any
  forwardUrl: any
  navTabId: any
  rel: any
}
