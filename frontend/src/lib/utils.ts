import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const number = value.replace(/\D/g, "");

  // Format based on length
  if (number.length <= 3) {
    return number;
  } else if (number.length <= 6) {
    return `${number.slice(0, 3)} ${number.slice(3)}`;
  } else if (number.length <= 10) {
    return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  } else {
    return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(
      6,
      10
    )} ${number.slice(10, 14)}`;
  }
}

export function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, "");
}

export function validatePhoneNumber(
  phoneNumber: string,
  countryCode: string
): string | null {
  const number = unformatPhoneNumber(phoneNumber);

  // Basic validation rules by country
  const rules: { [key: string]: { min: number; max: number } } = {
    "+1": { min: 10, max: 10 }, // US/Canada
    "+44": { min: 10, max: 10 }, // UK
    "+966": { min: 9, max: 9 }, // Saudi Arabia
    "+971": { min: 9, max: 9 }, // UAE
    "+965": { min: 8, max: 8 }, // Kuwait
    "+974": { min: 8, max: 8 }, // Qatar
    "+973": { min: 8, max: 8 }, // Bahrain
    "+968": { min: 8, max: 8 }, // Oman
  };

  const rule = rules[countryCode];
  if (!rule) {
    return "Invalid country code";
  }

  if (number.length < rule.min) {
    return `Phone number must be at least ${rule.min} digits`;
  }

  if (number.length > rule.max) {
    return `Phone number cannot exceed ${rule.max} digits`;
  }

  return null;
}
