import countryToCurrencyMap from 'country-to-currency';

const DEFAULT_CURRENCY = 'USD';

export function countryToCurrency(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  const currency =
    countryToCurrencyMap[code as keyof typeof countryToCurrencyMap];
  return typeof currency === 'string' && currency.length > 0
    ? currency
    : DEFAULT_CURRENCY;
}
