import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  BookOpen,
  BrainCircuit,
  Check,
  ExternalLink,
  Filter,
  Globe2,
  MapPinned,
  RotateCcw,
  Search,
  Shapes,
  X,
} from "lucide-react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import { countries, regions, type Country } from "./data/countries";
import { codeByNumericId, countryNameByCode } from "./lib/mapData";
import { createQuestion, type QuizQuestion } from "./lib/quiz";

type Tab = "explore" | "learn" | "patterns" | "quiz";

type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, { name?: string }> & {
  id?: string | number;
};

const allSubregions = Array.from(new Set(countries.map((country) => country.subregion))).sort();

const countryByCode = new Map(countries.map((country) => [country.code, country]));

const worldFeatures = feature(
  world as never,
  (world as { objects: { countries: never } }).objects.countries,
) as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry, { name?: string }>;

const mapFeatures = worldFeatures.features as CountryFeature[];

const projection = geoEqualEarth().fitSize([960, 500], { type: "Sphere" });
const path = geoPath(projection);
const mapFeatureCodes = new Set(
  mapFeatures
    .map((geo) => codeByNumericId.get(String(geo.id ?? "").padStart(3, "0")))
    .filter((code): code is string => Boolean(code)),
);
const markerCountries = countries.filter(
  (country) => country.latlng && !mapFeatureCodes.has(country.code),
);

type PatternGroup = {
  id: string;
  title: string;
  kind: string;
  description: string;
  codes: string[];
};

type PatternSortMode = "pattern" | "name" | "region" | "subregion";

const patternSortOptions: { value: PatternSortMode; label: string }[] = [
  { value: "pattern", label: "Pattern order" },
  { value: "name", label: "Country A-Z" },
  { value: "region", label: "Continent" },
  { value: "subregion", label: "Subregion" },
];

const compareCountryName = (a: Country, b: Country) => a.name.localeCompare(b.name);

const sortPatternCountries = (countriesToSort: Country[], sortMode: PatternSortMode) => {
  const sortedCountries = [...countriesToSort];

  if (sortMode === "name") {
    return sortedCountries.sort(compareCountryName);
  }

  if (sortMode === "region") {
    return sortedCountries.sort(
      (a, b) => a.region.localeCompare(b.region) || compareCountryName(a, b),
    );
  }

  if (sortMode === "subregion") {
    return sortedCountries.sort(
      (a, b) => a.subregion.localeCompare(b.subregion) || compareCountryName(a, b),
    );
  }

  return sortedCountries;
};

const patternGroups: PatternGroup[] = [
  {
    id: "red-white-blue",
    title: "Red, White, And Blue",
    kind: "Color family",
    description:
      "These flags often feel civic, maritime, revolutionary, or federal because the same three-color set repeats across very different layouts.",
    codes: [
      "US", "GB", "FR", "NL", "LU", "RU", "CZ", "SK", "SI", "HR", "RS", "IS", "NO", "TH", "LA",
      "KH", "CR", "CU", "PR", "PA", "CL", "DO", "AU", "NZ", "FJ", "WS", "CK",
    ],
  },
  {
    id: "pan-african",
    title: "Pan-African Reds, Golds, Greens",
    kind: "Color family",
    description:
      "Red, yellow or gold, green, and sometimes black create a shared visual language around independence, land, sacrifice, and African unity.",
    codes: [
      "ET", "GH", "SN", "CM", "ML", "GN", "GW", "BF", "BJ", "TG", "CG", "ZW", "ST", "MW", "ZM",
      "MZ", "KE", "ZA",
    ],
  },
  {
    id: "pan-arab",
    title: "Pan-Arab Red, White, Black, Green",
    kind: "Color family",
    description:
      "These flags share a regional color vocabulary, often arranged as horizontal bands with a triangle, emblem, or central symbol.",
    codes: ["AE", "EG", "IQ", "JO", "KW", "LY", "PS", "SD", "SY", "YE", "EH"],
  },
  {
    id: "nordic-cross",
    title: "Nordic Crosses",
    kind: "Shape family",
    description:
      "The off-center cross makes these flags instantly feel Scandinavian or Nordic even when the colors change.",
    codes: ["DK", "FI", "IS", "NO", "SE", "FO", "AX"],
  },
  {
    id: "union-jack-canton",
    title: "Union Jack In The Canton",
    kind: "History marker",
    description:
      "A Union Jack in the upper hoist usually signals British colonial history, Commonwealth ties, or a dependent-territory relationship.",
    codes: ["AU", "NZ", "FJ", "TV", "CK", "NU", "BM", "VG", "KY", "AI", "MS", "PN", "SH", "FK", "GS", "TC"],
  },
  {
    id: "crescent-star",
    title: "Crescent And Star",
    kind: "Symbol family",
    description:
      "Crescents and stars often point toward Islamic heritage, Ottoman influence, or a young nation/rising-state idea.",
    codes: ["TR", "TN", "PK", "AZ", "MY", "SG", "DZ", "MR", "LY", "MV", "TM", "UZ", "CC", "KM"],
  },
  {
    id: "center-disc-sun",
    title: "Central Disc, Sun, Or Moon",
    kind: "Shape family",
    description:
      "A strong central circle or sun makes the flag read as a single symbolic object before you notice the rest of the design.",
    codes: ["JP", "BD", "KR", "PW", "NE", "AR", "UY", "KZ", "MK", "KG", "PH", "RW"],
  },
  {
    id: "vertical-tricolors",
    title: "Vertical Tricolors",
    kind: "Layout family",
    description:
      "Three vertical bands create a shared rhythm across European, African, and American flags, with meaning carried mostly by color order.",
    codes: ["FR", "IT", "IE", "BE", "RO", "TD", "AD", "MD", "MX", "GT", "PE", "CI", "NG", "ML", "GN", "SN"],
  },
  {
    id: "two-color-vertical",
    title: "Two-Color Vertical Fields",
    kind: "Two-color layout",
    description:
      "These flags reduce the vertical layout to two colors, often using repeated side bands, a hoist stripe, or a strong central emblem in the same palette.",
    codes: ["CA", "NG", "PE", "PK", "BH", "QA"],
  },
  {
    id: "horizontal-tricolors",
    title: "Horizontal Tricolors",
    kind: "Layout family",
    description:
      "Horizontal bands are one of the most common flag grammars; many feel related even when their historical meanings differ.",
    codes: [
      "DE", "NL", "RU", "LU", "HU", "AT", "BG", "LT", "EE", "LV", "AM", "AZ", "CO", "EC", "VE",
      "BO", "PY", "YE", "EG", "SY", "IQ", "IR", "IN", "TH", "LA",
    ],
  },
  {
    id: "two-color-horizontal",
    title: "Two-Color Horizontal Fields",
    kind: "Two-color layout",
    description:
      "These flags keep the horizontal idea simple: two colors carry the whole memory hook through stacked bands, repeated bands, or a counterchanged symbol.",
    codes: ["AT", "ID", "LV", "MC", "PL", "UA", "GL", "SG"],
  },
  {
    id: "triangles-hoist",
    title: "Hoist Triangles And Wedges",
    kind: "Shape family",
    description:
      "A triangle at the hoist pulls your eye from the flagpole side into the rest of the flag, often adding revolutionary or regional identity.",
    codes: ["PH", "CZ", "CU", "PR", "PS", "SD", "JO", "BS", "TL", "SS", "KM", "DJ", "GQ", "ST", "ZW"],
  },
  {
    id: "diagonal-divisions",
    title: "Diagonals And Saltire Energy",
    kind: "Shape family",
    description:
      "Diagonal cuts make these flags feel dynamic, like movement across the field rather than stacked bands.",
    codes: ["ZA", "JM", "TZ", "TT", "SB", "PG", "SC", "NA", "ER", "CD", "VU"],
  },
  {
    id: "southern-cross",
    title: "Southern Cross",
    kind: "Sky marker",
    description:
      "The Southern Cross links flags to southern-hemisphere navigation, night skies, and Pacific or South Atlantic geography.",
    codes: ["AU", "NZ", "PG", "WS", "BR", "CK"],
  },
  {
    id: "stars-and-stripes",
    title: "Stars, Stripes, And State Counts",
    kind: "Counting pattern",
    description:
      "These flags use repeated stars or stripes as countable memory devices for states, provinces, colonies, or founding units.",
    codes: ["US", "MY", "LR", "GR", "UY", "CU", "PR", "HN", "SV", "VE"],
  },
  {
    id: "arms-emblems",
    title: "Centered Arms And Emblems",
    kind: "Symbol family",
    description:
      "These flags feel heraldic: the layout may be simple, but a coat of arms, eagle, shield, or seal carries the identity.",
    codes: ["MX", "ES", "PT", "SM", "VA", "AD", "MD", "RS", "HR", "ME", "BZ", "GT", "NI", "SV", "AL", "KZ", "SA"],
  },
];

const filterCountries = (region: string, subregion: string, search: string) => {
  const normalized = search.trim().toLowerCase();
  return countries.filter((country) => {
    const matchesRegion = region === "All" || country.region === region;
    const matchesSubregion = subregion === "All" || country.subregion === subregion;
    const matchesSearch =
      normalized.length === 0 ||
      country.name.toLowerCase().includes(normalized) ||
      country.region.toLowerCase().includes(normalized) ||
      country.subregion.toLowerCase().includes(normalized) ||
      country.colors.some((color) => color.name.toLowerCase().includes(normalized)) ||
      country.symbols.some((symbol) => symbol.name.toLowerCase().includes(normalized));

    return matchesRegion && matchesSubregion && matchesSearch;
  });
};

const TabButton = ({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <button className={`tab-button ${active ? "is-active" : ""}`} onClick={onClick} type="button">
    {icon}
    <span>{children}</span>
  </button>
);

const compactFlagUrl = (url: string) =>
  url.replace("https://flagcdn.com/", "https://flagcdn.com/w160/").replace(".svg", ".png");

const FlagImage = ({
  country,
  compact = false,
  priority = false,
}: {
  country: Country;
  compact?: boolean;
  priority?: boolean;
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span className="flag-fallback" aria-label={`${country.name} flag`}>
        {country.flagEmoji || country.code}
      </span>
    );
  }

  return (
    <img
      alt={`${country.name} flag`}
      className="flag-image"
      loading={priority ? "eager" : "lazy"}
      onError={() => setHasError(true)}
      src={compact ? compactFlagUrl(country.flagUrl) : country.flagUrl}
    />
  );
};

const WorldMap = ({
  selectedCode,
  onSelect,
}: {
  selectedCode: string;
  onSelect: (country: Country) => void;
}) => (
  <div className="map-panel" aria-label="World map country locator">
    <svg className="world-map" viewBox="0 0 960 500" role="img" aria-label="World map">
      <rect className="map-ocean" x="0" y="0" width="960" height="500" rx="0" />
      {mapFeatures.map((geo, index) => {
        const numericId = String(geo.id ?? "").padStart(3, "0");
        const code = codeByNumericId.get(numericId);
        const country = code ? countryByCode.get(code) : undefined;
        const isSelected = code === selectedCode;
        const isAvailable = Boolean(country);
        const label = code ? countryNameByCode.get(code) ?? code : "Country";
        const d = path(geo);

        if (!d) {
          return null;
        }

        return (
          <path
            aria-label={label}
            className={`map-country ${isAvailable ? "is-available" : ""} ${
              isSelected ? "is-selected" : ""
            }`}
            d={d}
            key={`${numericId}-${index}`}
            onClick={() => {
              if (country) {
                onSelect(country);
              }
            }}
            role={isAvailable ? "button" : "img"}
            tabIndex={isAvailable ? 0 : -1}
            onKeyDown={(event) => {
              if (country && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onSelect(country);
              }
            }}
          >
            <title>{label}</title>
          </path>
        );
      })}
      {markerCountries.map((country) => {
        if (!country.latlng) {
          return null;
        }

        const projected = projection([country.latlng[1], country.latlng[0]]);

        if (!projected) {
          return null;
        }

        const isSelected = country.code === selectedCode;

        return (
          <circle
            aria-label={country.name}
            className={`map-marker is-available ${isSelected ? "is-selected" : ""}`}
            cx={projected[0]}
            cy={projected[1]}
            key={`marker-${country.code}`}
            onClick={() => onSelect(country)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(country);
              }
            }}
            r={isSelected ? 5.5 : 3.2}
            role="button"
            tabIndex={0}
          >
            <title>{country.name}</title>
          </circle>
        );
      })}
    </svg>
    <div className="map-legend" aria-hidden="true">
      <span><i className="legend-selected" />Selected</span>
      <span><i className="legend-available" />Available</span>
      <span><i className="legend-muted" />Context</span>
    </div>
  </div>
);

const Filters = ({
  region,
  search,
  subregion,
  onRegionChange,
  onSearchChange,
  onSubregionChange,
}: {
  region: string;
  search: string;
  subregion: string;
  onRegionChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSubregionChange: (value: string) => void;
}) => {
  const subregionOptions = useMemo(
    () =>
      region === "All"
        ? allSubregions
        : allSubregions.filter((item) => countries.some((country) => country.region === region && country.subregion === item)),
    [region],
  );

  useEffect(() => {
    if (subregion !== "All" && !subregionOptions.includes(subregion)) {
      onSubregionChange("All");
    }
  }, [onSubregionChange, subregion, subregionOptions]);

  return (
    <section className="filters" aria-label="Country filters">
      <label className="search-box">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search country, color, symbol"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <label className="select-box">
        <Filter size={17} aria-hidden="true" />
        <select value={region} onChange={(event) => onRegionChange(event.target.value)}>
          <option value="All">All regions</option>
          {regions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="select-box">
        <MapPinned size={17} aria-hidden="true" />
        <select value={subregion} onChange={(event) => onSubregionChange(event.target.value)}>
          <option value="All">All subregions</option>
          {subregionOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
};

const CountryCard = ({
  country,
  isSelected,
  onSelect,
}: {
  country: Country;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button className={`country-card ${isSelected ? "is-selected" : ""}`} type="button" onClick={onSelect}>
    <FlagImage country={country} compact />
    <span>
      <strong>{country.name}</strong>
      <small>{country.subregion}{country.isCurated ? " / deep dive" : ""}</small>
    </span>
  </button>
);

const ResourceLink = ({ href, label }: { href: string; label: string }) => (
  <a
    className="wikipedia-link"
    href={href}
    rel="noreferrer"
    target="_blank"
  >
    <ExternalLink size={17} aria-hidden="true" />
    <span>{label}</span>
  </a>
);

const WikipediaLink = ({ country }: { country: Country }) => (
  <ResourceLink href={country.wikipediaUrl} label="Read on Wikipedia" />
);

const RelatedLinks = ({ country }: { country: Country }) =>
  country.relatedLinks?.length ? (
    <div className="resource-links">
      {country.relatedLinks.map((link) => (
        <ResourceLink href={link.url} key={link.url} label={link.label} />
      ))}
    </div>
  ) : null;

const ExploreView = ({
  filteredCountries,
  selectedCountry,
  onSelectCountry,
}: {
  filteredCountries: Country[];
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
}) => (
  <div className="explore-grid">
    <section className="country-list" aria-label="Flag list">
      {filteredCountries.map((country) => (
        <CountryCard
          country={country}
          isSelected={selectedCountry.code === country.code}
          key={country.code}
          onSelect={() => onSelectCountry(country)}
        />
      ))}
    </section>
    <section className="preview-panel" aria-label={`${selectedCountry.name} preview`}>
      <div className="preview-flag">
        <FlagImage country={selectedCountry} priority />
      </div>
      <div className="lesson-copy">
        <p className="eyebrow">{selectedCountry.region} / {selectedCountry.subregion}</p>
        <h1>{selectedCountry.name}</h1>
        <p className="lead">{selectedCountry.memoryHook}</p>
        <p>{selectedCountry.meaning}</p>
        <WikipediaLink country={selectedCountry} />
      </div>
      <WorldMap selectedCode={selectedCountry.code} onSelect={onSelectCountry} />
    </section>
  </div>
);

const LearnView = ({
  country,
  onSelectCountry,
}: {
  country: Country;
  onSelectCountry: (country: Country) => void;
}) => (
  <div className="learn-grid">
    <section className="flag-study" aria-label={`${country.name} flag meaning`}>
      <div className="study-flag">
        <FlagImage country={country} priority />
      </div>
      <div className="lesson-copy">
        <p className="eyebrow">{country.region} / {country.subregion}</p>
        <h1>{country.name}</h1>
        <p className="lead">{country.pattern}</p>
        <p>{country.meaning}</p>
        <WikipediaLink country={country} />
        <RelatedLinks country={country} />
        <div className="memory-hook">
          <BrainCircuit size={20} aria-hidden="true" />
          <span>{country.memoryHook}</span>
        </div>
      </div>
    </section>

    <section className="meaning-grid" aria-label="Flag colors and symbols">
      <div className="detail-block">
        <h2>Colors</h2>
        {country.colors.length > 0 ? (
          <div className="color-list">
            {country.colors.map((color) => (
              <div className="color-row" key={`${country.code}-${color.name}`}>
                <span className="swatch" style={{ backgroundColor: color.hex }} />
                <strong>{color.name}</strong>
                <span>{color.meaning}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>Detailed color symbolism has not been curated yet for this entry.</p>
        )}
      </div>
      <div className="detail-block">
        <h2>Symbols</h2>
        {country.symbols.length > 0 ? (
          <div className="symbol-list">
            {country.symbols.map((symbol) => (
              <p key={`${country.code}-${symbol.name}`}>
                <strong>{symbol.name}:</strong> {symbol.meaning}
              </p>
            ))}
          </div>
        ) : (
          <p>The flag relies on color and layout rather than a separate emblem.</p>
        )}
      </div>
    </section>

    <section className="geo-grid" aria-label={`${country.name} geography and history`}>
      <WorldMap selectedCode={country.code} onSelect={onSelectCountry} />
      <div className="detail-block geo-copy">
        <h2>Place And History</h2>
        <p>{country.geoContext.location}</p>
        <div className="neighbor-line">
          <strong>Nearby:</strong>
          <span>{country.geoContext.neighbors.join(", ")}</span>
        </div>
        <ul>
          {country.geoContext.history.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  </div>
);

const PatternsView = ({
  filteredCountries,
  onOpenCountry,
}: {
  filteredCountries: Country[];
  onOpenCountry: (country: Country) => void;
}) => {
  const [selectedKind, setSelectedKind] = useState("All");
  const [selectedGroupId, setSelectedGroupId] = useState(patternGroups[0]?.id ?? "");
  const [sortMode, setSortMode] = useState<PatternSortMode>("pattern");
  const visibleCodes = new Set(filteredCountries.map((country) => country.code));
  const availableGroups = patternGroups
    .map((group) => ({
      ...group,
      countries: group.codes
        .map((code) => countryByCode.get(code))
        .filter((country): country is Country => country !== undefined && visibleCodes.has(country.code)),
    }))
    .filter((group) => group.countries.length > 0);
  const kindOptions = ["All", ...Array.from(new Set(patternGroups.map((group) => group.kind))).sort()];
  const visibleGroups =
    selectedKind === "All"
      ? availableGroups
      : availableGroups.filter((group) => group.kind === selectedKind);
  const selectedGroup =
    visibleGroups.find((group) => group.id === selectedGroupId) ?? visibleGroups[0] ?? null;
  const sortedSelectedCountries = selectedGroup
    ? sortPatternCountries(selectedGroup.countries, sortMode)
    : [];

  useEffect(() => {
    if (!selectedGroup && visibleGroups[0]) {
      setSelectedGroupId(visibleGroups[0].id);
      return;
    }

    if (selectedGroup && selectedGroup.id !== selectedGroupId) {
      setSelectedGroupId(selectedGroup.id);
    }
  }, [selectedGroup, selectedGroupId, visibleGroups]);

  return (
    <div className="patterns-layout">
      <section className="patterns-intro">
        <p className="eyebrow">Common Patterns</p>
        <h1>Flags that look and feel related.</h1>
        <p className="lead">
          Browse recurring color families, shapes, symbols, and historical markers. Region and search filters still apply, so you can compare patterns globally or within one part of the world.
        </p>
      </section>

      <section className="patterns-browser" aria-label="Common flag pattern browser">
        <div className="pattern-controls">
          <label className="select-box">
            <Shapes size={17} aria-hidden="true" />
            <select value={selectedKind} onChange={(event) => setSelectedKind(event.target.value)}>
              {kindOptions.map((kind) => (
                <option key={kind} value={kind}>
                  {kind === "All" ? "All pattern types" : kind}
                </option>
              ))}
            </select>
          </label>
          <label className="select-box">
            <Filter size={17} aria-hidden="true" />
            <select
              value={selectedGroup?.id ?? ""}
              onChange={(event) => setSelectedGroupId(event.target.value)}
            >
              {visibleGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.title} ({group.countries.length})
                </option>
              ))}
            </select>
          </label>
          <label className="select-box">
            <ArrowUpDown size={17} aria-hidden="true" />
            <select
              aria-label="Sort pattern countries"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as PatternSortMode)}
            >
              {patternSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visibleGroups.length > 0 ? (
          <>
            <div className="pattern-chip-row" aria-label="Pattern group shortcuts">
              {visibleGroups.map((group) => (
                <button
                  className={`pattern-chip ${selectedGroup?.id === group.id ? "is-active" : ""}`}
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  type="button"
                >
                  <span className="pattern-chip-copy">
                    <span className="pattern-chip-kind">{group.kind}</span>
                    <strong>{group.title}</strong>
                  </span>
                  <span className="pattern-chip-count">{group.countries.length} flags</span>
                </button>
              ))}
            </div>

            {selectedGroup ? (
              <article className="pattern-group" key={selectedGroup.id}>
                <div className="pattern-group-header">
                  <div>
                    <p className="eyebrow">{selectedGroup.kind}</p>
                    <h2>{selectedGroup.title}</h2>
                    <p>{selectedGroup.description}</p>
                  </div>
                  <span>{selectedGroup.countries.length} flags</span>
                </div>
                <div className="pattern-flag-grid">
                  {sortedSelectedCountries.map((country) => (
                    <button
                      className="pattern-flag"
                      key={`${selectedGroup.id}-${country.code}`}
                      onClick={() => onOpenCountry(country)}
                      type="button"
                    >
                      <FlagImage country={country} compact priority />
                      <span>{country.name}</span>
                    </button>
                  ))}
                </div>
              </article>
            ) : null}
          </>
        ) : (
          <div className="empty-patterns">
            <h2>No pattern groups match the current filters.</h2>
            <p>Broaden the region, subregion, or search filters to compare more flags.</p>
          </div>
        )}
      </section>
    </div>
  );
};

const QuizView = ({
  pool,
  onSelectCountry,
}: {
  pool: Country[];
  onSelectCountry: (country: Country) => void;
}) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(() => createQuestion(pool));
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });

  useEffect(() => {
    setQuestion(createQuestion(pool));
    setSelectedCode(null);
  }, [pool]);

  const answerCountry = question ? countryByCode.get(question.answerCode) : undefined;
  const answered = selectedCode !== null;
  const isCorrect = selectedCode === question?.answerCode;

  useEffect(() => {
    if (answerCountry) {
      onSelectCountry(answerCountry);
    }
  }, [answerCountry, onSelectCountry]);

  const chooseAnswer = (country: Country) => {
    if (!question || answered) {
      return;
    }

    const correct = country.code === question.answerCode;
    setSelectedCode(country.code);
    setScore((current) => ({
      correct: current.correct + (correct ? 1 : 0),
      total: current.total + 1,
      streak: correct ? current.streak + 1 : 0,
    }));

    if (answerCountry) {
      onSelectCountry(answerCountry);
    }
  };

  const nextQuestion = () => {
    const next = createQuestion(pool);
    setQuestion(next);
    setSelectedCode(null);
    if (next) {
      const nextCountry = countryByCode.get(next.answerCode);
      if (nextCountry) {
        onSelectCountry(nextCountry);
      }
    }
  };

  const resetScore = () => {
    setScore({ correct: 0, total: 0, streak: 0 });
    setQuestion(createQuestion(pool));
    setSelectedCode(null);
  };

  if (pool.length < 4 || !question || !answerCountry) {
    return (
      <section className="quiz-shell">
        <h1>Quiz</h1>
        <p className="lead">Choose at least four countries with the current filters.</p>
      </section>
    );
  }

  return (
    <div
      className="quiz-layout"
      data-answer-code={question.answerCode}
      data-answer-name={answerCountry.name}
    >
      <section className="quiz-shell" aria-label="Flag pattern quiz">
        <div className="score-row">
          <span>{score.correct}/{score.total} correct</span>
          <span>{score.streak} streak</span>
          <button className="icon-button" type="button" onClick={resetScore} aria-label="Reset score">
            <RotateCcw size={18} />
          </button>
        </div>
        <p className="eyebrow">{question.kind} clue</p>
        <h1>{question.prompt}</h1>
        <div className="answer-grid">
          {question.options.map((country) => {
            const chosen = selectedCode === country.code;
            const correct = answered && country.code === question.answerCode;
            const wrong = chosen && !correct;

            return (
              <button
                className={`answer-option ${correct ? "is-correct" : ""} ${wrong ? "is-wrong" : ""}`}
                disabled={answered}
                key={country.code}
                onClick={() => chooseAnswer(country)}
                type="button"
              >
                <FlagImage country={country} compact priority />
                <span>{country.name}</span>
                {correct ? <Check size={18} aria-hidden="true" /> : null}
                {wrong ? <X size={18} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
        {answered ? (
          <div className={`feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
            <strong>{isCorrect ? "Correct" : `Answer: ${answerCountry.name}`}</strong>
            <p>{question.explanation}</p>
            <button className="primary-action" type="button" onClick={nextQuestion}>
              Next clue
            </button>
          </div>
        ) : null}
      </section>
      <aside
        className="quiz-context"
        aria-label="Current quiz country context"
        data-context-code={answerCountry.code}
        data-revealed={answered ? "true" : "false"}
      >
        <WorldMap selectedCode={question.answerCode} onSelect={onSelectCountry} />
        <div className="detail-block">
          {answered ? (
            <>
              <h2>{answerCountry.name}</h2>
              <p>{answerCountry.geoContext.location}</p>
              <WikipediaLink country={answerCountry} />
            </>
          ) : (
            <>
              <h2>Map clue</h2>
              <p>The highlighted place is the answer. Use the map with the prompt, then choose the matching flag.</p>
              <div className="quiz-meta">
                <span>{answerCountry.region}</span>
                <span>{answerCountry.subregion}</span>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState<Tab>("explore");
  const [region, setRegion] = useState("All");
  const [subregion, setSubregion] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const filteredCountries = useMemo(
    () => filterCountries(region, subregion, search),
    [region, search, subregion],
  );

  useEffect(() => {
    if (
      filteredCountries.length > 0 &&
      !filteredCountries.some((country) => country.code === selectedCountry.code)
    ) {
      setSelectedCountry(filteredCountries[0]);
    }
  }, [filteredCountries, selectedCountry.code]);

  const selectCountry = useCallback((country: Country) => {
    setSelectedCountry(country);
  }, []);

  const openCountryLesson = useCallback((country: Country) => {
    setSelectedCountry(country);
    setTab("learn");
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
        <p className="eyebrow">World Flag Patterns</p>
        <h1>Flags, places, stories.</h1>
        <p className="header-count">{countries.length} countries and territories</p>
      </div>
        <nav className="tabs" aria-label="App sections">
          <TabButton active={tab === "explore"} icon={<Globe2 size={18} />} onClick={() => setTab("explore")}>
            Explore
          </TabButton>
          <TabButton active={tab === "learn"} icon={<BookOpen size={18} />} onClick={() => setTab("learn")}>
            Learn
          </TabButton>
          <TabButton active={tab === "patterns"} icon={<Shapes size={18} />} onClick={() => setTab("patterns")}>
            Patterns
          </TabButton>
          <TabButton active={tab === "quiz"} icon={<BrainCircuit size={18} />} onClick={() => setTab("quiz")}>
            Quiz
          </TabButton>
        </nav>
      </header>

      <Filters
        region={region}
        search={search}
        subregion={subregion}
        onRegionChange={setRegion}
        onSearchChange={setSearch}
        onSubregionChange={setSubregion}
      />

      {tab === "explore" ? (
        <ExploreView
          filteredCountries={filteredCountries}
          selectedCountry={selectedCountry}
          onSelectCountry={selectCountry}
        />
      ) : null}

      {tab === "learn" ? (
        <LearnView country={selectedCountry} onSelectCountry={selectCountry} />
      ) : null}

      {tab === "patterns" ? (
        <PatternsView filteredCountries={filteredCountries} onOpenCountry={openCountryLesson} />
      ) : null}

      {tab === "quiz" ? (
        <QuizView
          pool={filteredCountries}
          onSelectCountry={selectCountry}
        />
      ) : null}
    </main>
  );
}
