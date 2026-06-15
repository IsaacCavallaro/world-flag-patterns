import worldCountries from "world-countries";

type WorldCountry = {
  cca2: string;
  ccn3?: string;
  name: {
    common: string;
  };
};

const typedCountries = worldCountries as WorldCountry[];

export const codeByNumericId = new Map(
  typedCountries
    .filter((country) => country.ccn3)
    .map((country) => [country.ccn3 as string, country.cca2]),
);

export const countryNameByCode = new Map(
  typedCountries.map((country) => [country.cca2, country.name.common]),
);
