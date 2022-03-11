export interface CassoResponse<T> {
  error: number
  message: string
  data: T
}

export interface UserInfo {
  user: {
    id: number
    email: string
  }
  business: {
    id: number
    name: string
  }
  bankAccs: {
    id: number
    bank: {
      bin: number
      codeName: string
    }
    bankAccountName: string
    bankSubAccId: string
    balance: number
    memo: string | null
    connectStatus: number
    planStatus: number
  }[]
}
