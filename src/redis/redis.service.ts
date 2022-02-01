import {Injectable} from '@nestjs/common'
import IORedis from 'ioredis'

@Injectable()
export class RedisService extends IORedis {}
