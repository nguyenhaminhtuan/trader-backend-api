export class GenerateQRDto {
  acqId: number
  accountNo: number
  accountName: string
  amount: number
  addInfo: string
  template: 'qr_only' | 'compact' | 'compact2'
}
