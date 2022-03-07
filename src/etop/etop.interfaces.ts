import {Game} from './etop.enums'
import {EtopItem} from './etop.model'

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

export interface EtopGift {
  appid: Game
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
