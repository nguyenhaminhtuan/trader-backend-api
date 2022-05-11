export class GenerateQRDto {
  acqId: number
  accountNo: string
  accountName: string
  amount: number
  addInfo: string
  template: 'qr_only' | 'compact' | 'compact2'
}
