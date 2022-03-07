import {Controller, Get} from '@nestjs/common'
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus'
import {ConfigService, EnvironmentVariables} from 'config'
import {MongoIndicator} from './indicators'

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly mongoIndicator: MongoIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('internet', 'https://google.com'),
      () =>
        this.http.responseCheck(
          'etopfun',
          this.configService.get('ETOP_API_URL'),
          (res) => res.status === 200
        ),
      () => this.mongoIndicator.isHealthy('database'),
    ])
  }
}
