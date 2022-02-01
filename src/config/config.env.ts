import {
  IsEnum,
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator'

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment

  @IsIP('4')
  HOST = '127.0.0.1'

  @IsNumber()
  PORT: number

  @IsUrl()
  STEAM_OPENID_IDENTIFIER: string

  @IsNotEmpty()
  @IsString()
  STEAM_OPENID_REALM: string

  @IsNotEmpty()
  @IsString()
  STEAM_OPENID_RETURN_URL: string

  @IsUrl()
  STEAM_API_URL: string

  @IsNotEmpty()
  @IsString()
  STEAM_API_KEY: string

  @IsNotEmpty()
  @IsString()
  SESSION_COOKIE_SECRET: string

  @IsNumber()
  SESSION_COOKIE_TTL = 86400000

  @IsNotEmpty()
  @IsString()
  REDIS_HOST = '127.0.0.1'

  @IsNumber()
  REDIS_PORT = 6379
}
