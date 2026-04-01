import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

type RatesResponse = {
  base?: string;
  rates?: Record<string, number>;
};

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private parseFallbackMap(): Record<string, number> {
    const raw = this.config.get<string>('FALLBACK_RATES_JSON');
    if (!raw?.trim()) return {};
    try {
      const parsed = JSON.parse(raw) as Record<string, number>;
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      this.logger.warn('FALLBACK_RATES_JSON no es JSON válido');
      return {};
    }
  }

  /**
   * Tasas desde API: 1 USD = rates[XXX] unidades de XXX (formato exchangerate-api.com v4).
   */
  async getUsdToCurrencyRate(currency: string): Promise<{
    rate: number;
    usedFallback: boolean;
  }> {
    const code = currency.trim().toUpperCase();
    if (code === 'USD') {
      return { rate: 1, usedFallback: false };
    }

    const url =
      this.config.get<string>('EXCHANGE_RATE_API_URL') ??
      'https://api.exchangerate-api.com/v4/latest/USD';

    try {
      const { data } = await firstValueFrom(
        this.http.get<RatesResponse>(url, { timeout: 10_000 }),
      );
      const r = data?.rates?.[code];
      if (typeof r === 'number' && r > 0) {
        return { rate: r, usedFallback: false };
      }
      this.logger.warn(`Moneda ${code} no encontrada en respuesta de ${url}`);
    } catch (err) {
      const msg = err instanceof AxiosError ? err.message : String(err);
      this.logger.warn(`API de tasas falló: ${msg}`);
    }

    const fallbacks = this.parseFallbackMap();
    const fb = fallbacks[code];
    if (typeof fb === 'number' && fb > 0) {
      return { rate: fb, usedFallback: true };
    }

    const defaultUsdEur = fallbacks['EUR'] ?? 0.85;
    if (code === 'EUR') {
      return { rate: defaultUsdEur, usedFallback: true };
    }

    this.logger.error(`Sin tasa para ${code} ni fallback`);
    throw new ServiceUnavailableException(
      'No se pudo obtener la tasa de cambio y no hay valor por defecto configurado para esta moneda',
    );
  }
}
