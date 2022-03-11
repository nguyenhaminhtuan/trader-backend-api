import {Injectable} from '@nestjs/common'
import {HttpService} from '@nestjs/axios'
import {firstValueFrom, map} from 'rxjs'
import {GenerateQR, Bank, VietQRResponse} from './vietqr.interface'
import {GenerateQRDto} from './dto'

@Injectable()
export class VietQRService {
  constructor(private readonly httpService: HttpService) {}

  generateQRCode(dto: GenerateQRDto): Promise<VietQRResponse<GenerateQR>> {
    const source$ = this.httpService
      .post<VietQRResponse<GenerateQR>>('/v2/generate', dto)
      .pipe(map((res) => res.data))
    return firstValueFrom(source$)
  }

  getBanks(): Promise<VietQRResponse<Bank[]>> {
    const source$ = this.httpService
      .get<VietQRResponse<Bank[]>>('/v2/banks')
      .pipe(map((res) => res.data))
    return firstValueFrom(source$)
  }
}
