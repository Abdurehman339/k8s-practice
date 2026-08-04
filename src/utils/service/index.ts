import { EOTP, ESortDirection } from '@prisma/client';
import { getDistanceFromMileReturnType, PaginationReturn } from './types';
import { TGetUniqueTypeofMatcher } from './types';
import { AppConfig } from 'src/config';

class UtilityService {
  constructor() {}

  public join(array?: string[]): string {
    if (!array) return undefined;
    return array.filter(Boolean).join(' ');
  }

  public clean<T extends Record<string, any>>(obj?: T): Partial<T> {
    if (!obj) return;
    const cleanedEntries = Object.entries(obj).filter(
      ([_, value]) => value !== undefined && value !== null && value !== '',
    );

    return cleanedEntries.reduce((acc, [key, value]) => {
      acc[key as keyof T] = value as T[keyof T];
      return acc;
    }, {} as Partial<T>);
  }

  public pagination = (
    page: number = 1,
    per_page: number = 5,
    search?: string,
  ): PaginationReturn => {
    const skip = ((page || 1) - 1) * per_page;
    const limit = per_page;

    let keyword = search || '';
    if (search) {
      keyword = search?.trim();
    }

    return {
      skip,
      limit,
      take: per_page,
      keyword,
    };
  };

  get_mile_distance = (mile: number = 0): getDistanceFromMileReturnType => {
    const meters = mile * 1609.34;
    const centimeters = mile * 100;
    const kilometers = mile * 1.60934;
    const inches = mile * 63360;
    const feets = mile * 5280;

    return {
      meters,
      centimeters,
      kilometers,
      inches,
      feets,
    };
  };

  public clean_text(search?: string) {
    if (!search) return undefined;
    return search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  public random_string = (
    length = 10,
    input: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ) => {
    const chars = input;

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  random_number(length = 4) {
    let token: string;
    if (AppConfig.app.debug) {
      token = '0'.repeat(length); // e.g., 0000 for length=4
    } else {
      const min = Math.pow(10, length - 1); // smallest number with given length
      const max = Math.pow(10, length) - 1; // largest number with given length
      token = Math.floor(Math.random() * (max - min + 1) + min).toString();
    }
    return token;
  }

  toJsObject(array: any = [], index = 0) {
    if (Array.isArray(array)) {
      if (array.length > 0) {
        return array[index];
      }
    }
    return null;
  }

  getRefreshTokenExpiry(days: number = 7): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000); // 7 days
  }

  isEmpty(value?: any): boolean {
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    if (typeof value === 'string') return value.trim().length === 0;
    return false;
  }

  getArray<T>(
    valueOrValues?: any,
    matcher: TGetUniqueTypeofMatcher = 'string',
    unique: boolean = true,
  ): Array<T> {
    if (!valueOrValues) return [];

    if (typeof valueOrValues === 'string') {
      if (valueOrValues.includes('[') || valueOrValues.includes(']')) {
        return [];
      }
    }

    // Wrap single value into array if it matches the type
    const arrayValue = Array.isArray(valueOrValues)
      ? valueOrValues
      : typeof valueOrValues === matcher
        ? [valueOrValues]
        : [];

    if (unique) {
      return Array.from(new Set(arrayValue));
    }
    return arrayValue;
  }

  ternary(first?: any, last?: any): boolean {
    if (!first) return false;

    return first ? first : last;
  }

  OR<T>(input?: T | T[]): boolean {
    if (!input) return false;
    if (Array.isArray(input)) {
      return input.some(Boolean); // true if any item is truthy
    }
    return Boolean(input); // direct truthiness check
  }

  public get_email_payload(type: EOTP, otp: string) {
    let text: string = null;
    let subject: string;

    switch (type) {
      case EOTP.Forgot_Password:
        text = `Your Forgot Password OTP is <b>${otp}</b>`;
        subject = `Take Therapy: Forgot Password OTP`;
        break;
      case EOTP.Verify:
        text = `Your account verification code is <b>${otp}</b>`;
        subject = `Take Therapy: Verify account`;
        break;
      default:
        text = otp;
        subject = 'Take Therapy';
        break;
    }

    return { text, subject };
  }
}

const Utils = new UtilityService();
Object.freeze(Utils);

export default Utils;
