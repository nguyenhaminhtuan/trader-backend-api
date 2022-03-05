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
  HOST: string

  @IsNumber()
  PORT: number

  @IsNotEmpty()
  @IsString()
  DOMAIN_URL: string

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

  @IsNotEmpty()
  SESSION_COOKIE_TTL: string

  SESSION_PREFIX = 'sess:'

  @IsNotEmpty()
  @IsString()
  REDIS_HOST: string

  @IsNotEmpty()
  REDIS_PORT: string

  @IsNotEmpty()
  @IsString()
  DB_URI: string

  @IsString()
  DB_USERNAME: string

  @IsString()
  DB_PASSWORD: string

  @IsNotEmpty()
  @IsString()
  DB_NAME: string

  @IsUrl()
  ETOP_API_URL: string

  @IsNotEmpty()
  @IsString()
  ETOP_EMAIL: string

  @IsNotEmpty()
  @IsString()
  ETOP_PASSWORD: string

  @IsNotEmpty()
  @IsString()
  ETOP_HOT_VERSION: string

  @IsNotEmpty()
  THROTTLE_TTL = 30

  @IsNotEmpty()
  THROTTLE_LIMIT = 10

  @IsString()
  SENTRY_DSN: string

  @IsNotEmpty()
  @IsString()
  VIETQR_API_URL: string

  @IsNotEmpty()
  @IsString()
  VIETQR_ACB_ID: string

  @IsNotEmpty()
  @IsString()
  CASSO_API_URL: string

  @IsNotEmpty()
  @IsString()
  CASSO_API_KEY: string

  @IsNotEmpty()
  @IsString()
  CASSO_API_SECRET: string

  @IsNotEmpty()
  @IsString()
  BANK_ACCOUNT_NO: string

  @IsNotEmpty()
  @IsString()
  BANK_ACCOUNT_NAME: string
}
