export interface Country {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

export const countries: Country[] = [
  {
    name: "United States",
    code: "US",
    dial_code: "+1",
    flag: "🇺🇸",
  },
  {
    name: "United Kingdom",
    code: "GB",
    dial_code: "+44",
    flag: "🇬🇧",
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    dial_code: "+966",
    flag: "🇸🇦",
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    dial_code: "+971",
    flag: "🇦🇪",
  },
  {
    name: "Kuwait",
    code: "KW",
    dial_code: "+965",
    flag: "🇰🇼",
  },
  {
    name: "Qatar",
    code: "QA",
    dial_code: "+974",
    flag: "🇶🇦",
  },
  {
    name: "Bahrain",
    code: "BH",
    dial_code: "+973",
    flag: "🇧🇭",
  },
  {
    name: "Oman",
    code: "OM",
    dial_code: "+968",
    flag: "🇴🇲",
  },
  // Add more countries as needed
];
