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

  @IsNotEmpty()
  @IsString()
  DB_URI: string

  @IsNotEmpty()
  @IsString()
  SESSION_COOKIE_SECRET: string

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

  @IsString()
  SENTRY_DSN: string

  @IsNotEmpty()
  @IsString()
  VIETQR_API_URL: string

  @IsNotEmpty()
  @IsString()
  CASSO_API_URL: string

  @IsNotEmpty()
  @IsString()
  CASSO_API_KEY: string

  @IsNotEmpty()
  @IsString()
  CASSO_API_SECRET: string
}
