import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  DATABASE_URL: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  PORT?: number;

  @IsOptional()
  @IsString()
  CLIENT_URL?: string;

  @IsOptional()
  @IsString()
  EXCHANGE_RATE_API_URL?: string;

  /** JSON: {"EUR":0.92,"MXN":17.5} — tasas USD→moneda si falla la API */
  @IsOptional()
  @IsString()
  FALLBACK_RATES_JSON?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig: EnvironmentVariables = plainToInstance(
    EnvironmentVariables,
    config,
    {
    enableImplicitConversion: true,
    },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formatted = errors
      .map((err) =>
        Object.values((err.constraints as Record<string, string>) ?? {}).join(
          ', ',
        ),
      )
      .join('\n');
    throw new Error(`\n❌ Environment validation failed:\n${formatted}\n`);
  }

  if (
    validatedConfig.PORT === undefined ||
    validatedConfig.PORT === null ||
    Number.isNaN(validatedConfig.PORT)
  ) {
    validatedConfig.PORT = 3000;
  }
  return validatedConfig;
}
