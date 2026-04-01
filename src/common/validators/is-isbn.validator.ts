import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

function normalizeIsbn(value: string): string {
  return value.replace(/[-\s]/g, '');
}

export function IsIsbn(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isIsbn',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const digits = normalizeIsbn(value);
          if (!/^\d+$/.test(digits)) return false;
          return digits.length === 10 || digits.length === 13;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe ser un ISBN-10 o ISBN-13 válido (solo dígitos, guiones opcionales)`;
        },
      },
    });
  };
}

export function isbnDigits(value: string): string {
  return normalizeIsbn(value);
}
