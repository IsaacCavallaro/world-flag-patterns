import worldCountries from "world-countries";

export type Region =
  | "Africa"
  | "Americas"
  | "Antarctic"
  | "Asia"
  | "Europe"
  | "Oceania";

export type FlagColor = {
  name: string;
  hex: string;
  meaning: string;
};

export type FlagSymbol = {
  name: string;
  meaning: string;
};

export type GeoContext = {
  location: string;
  neighbors: string[];
  history: string[];
};

export type Country = {
  code: string;
  name: string;
  region: Region;
  subregion: string;
  flagUrl: string;
  wikipediaUrl: string;
  relatedLinks?: { label: string; url: string }[];
  flagEmoji?: string;
  isCurated: boolean;
  capital: string[];
  latlng?: [number, number];
  independent?: boolean | null;
  unMember?: boolean;
  colors: FlagColor[];
  symbols: FlagSymbol[];
  pattern: string;
  meaning: string;
  memoryHook: string;
  geoContext: GeoContext;
};

const flagUrl = (code: string) => `https://flagcdn.com/${code.toLowerCase()}.svg`;

const wikipediaSlugOverrides = new Map<string, string>([
  ["DR Congo", "Democratic_Republic_of_the_Congo"],
  ["Micronesia", "Federated_States_of_Micronesia"],
  ["Palestine", "State_of_Palestine"],
  ["Saint Martin", "Collectivity_of_Saint_Martin"],
  ["South Georgia", "South_Georgia_and_the_South_Sandwich_Islands"],
  ["Türkiye", "Turkey"],
]);

const wikipediaUrl = (name: string) => {
  const slug = wikipediaSlugOverrides.get(name) ?? name.replace(/ /g, "_");
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(slug).replace(/%2F/g, "/")}`;
};

type WorldCountry = {
  cca2: string;
  cca3: string;
  name: {
    common: string;
  };
  region: Region;
  subregion?: string;
  capital?: string[];
  borders?: string[];
  independent?: boolean | null;
  unMember?: boolean;
  flag?: string;
  latlng?: [number, number];
  landlocked?: boolean;
};

const worldCountryList = worldCountries as WorldCountry[];

const nameByCca3 = new Map(
  worldCountryList.map((country) => [country.cca3, country.name.common]),
);

const formatList = (items: string[]) => {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
};

const statusLabel = (country: WorldCountry) => {
  if (country.unMember) {
    return "United Nations member country";
  }

  if (country.independent === true) {
    return "independent country";
  }

  if (country.independent === false) {
    return "country or territory in the global dataset";
  }

  return "special-status country or territory";
};

const createGlobalCountry = (source: WorldCountry): Country => {
  const subregion = source.subregion || source.region;
  const capitals = source.capital ?? [];
  const borderNames = (source.borders ?? [])
    .map((code) => nameByCca3.get(code) ?? code)
    .sort((a, b) => a.localeCompare(b));
  const capitalText =
    capitals.length > 0 ? `capital ${formatList(capitals)}` : "no permanent capital listed";
  const borderText =
    borderNames.length > 0
      ? `land borders with ${formatList(borderNames)}`
      : "no listed land borders";

  return {
    code: source.cca2,
    name: source.name.common,
    region: source.region,
    subregion,
    flagUrl: flagUrl(source.cca2),
    wikipediaUrl: wikipediaUrl(source.name.common),
    flagEmoji: source.flag,
    isCurated: false,
    capital: capitals,
    latlng: source.latlng,
    independent: source.independent,
    unMember: source.unMember,
    colors: [],
    symbols: [],
    pattern:
      "Use the flag image as the visual pattern anchor; a deeper color-and-symbol note can be added to this global entry.",
    meaning: `${source.name.common} is included as a ${statusLabel(source)} in ${subregion}, ${source.region}. Its flag is paired with map position and neighboring-place context.`,
    memoryHook: `Connect the flag to ${capitalText} and ${borderText}.`,
    geoContext: {
      location: `${source.name.common} is in ${subregion}, ${source.region}.`,
      neighbors: borderNames,
      history: [
        `Map anchor: ${capitalText}.`,
        borderNames.length > 0
          ? `Border anchor: it borders ${formatList(borderNames)}.`
          : source.landlocked
            ? "Border anchor: the dataset lists no direct land borders, so use its enclosed inland position as the map cue."
            : "Border anchor: the dataset lists no land borders, so coastline, island, sea, or polar position is the map cue.",
        source.unMember
          ? "Status anchor: it is listed as a United Nations member in the country dataset."
          : "Status anchor: it is included in the global country dataset even though it is not listed as a United Nations member.",
      ],
    },
  };
};

const curatedCountries: Omit<
  Country,
  "capital" | "flagEmoji" | "independent" | "isCurated" | "unMember" | "wikipediaUrl"
>[] = [
  {
    code: "JP",
    name: "Japan",
    region: "Asia",
    subregion: "East Asia",
    flagUrl: flagUrl("JP"),
    colors: [
      { name: "White", hex: "#ffffff", meaning: "honesty and purity" },
      { name: "Red", hex: "#bc002d", meaning: "the sun disc and warm vitality" },
    ],
    symbols: [{ name: "Sun disc", meaning: "Japan's long association with the rising sun" }],
    pattern: "A single red disc centered on a white field.",
    meaning: "The Nisshoki centers the sun as Japan's core national symbol.",
    memoryHook: "Japan sits east of mainland Asia, so the sun rises from Japan's direction for much of the region.",
    geoContext: {
      location: "Island chain off East Asia, between the Pacific Ocean and the Sea of Japan.",
      neighbors: ["South Korea", "North Korea", "China", "Russia"],
      history: [
        "Its island geography helped create a strong maritime culture and distinct political history.",
        "The rising-sun association is reinforced by Japan's position east of the Asian mainland.",
        "The Sea of Japan separates Japan from Korea and Russia, making nearby coasts important in trade and conflict.",
      ],
    },
  },
  {
    code: "CN",
    name: "China",
    region: "Asia",
    subregion: "East Asia",
    flagUrl: flagUrl("CN"),
    colors: [
      { name: "Red", hex: "#de2910", meaning: "revolution and celebration" },
      { name: "Yellow", hex: "#ffde00", meaning: "light, unity, and the stars" },
    ],
    symbols: [
      { name: "Large star", meaning: "the Communist Party of China" },
      { name: "Four smaller stars", meaning: "the people united around the larger star" },
    ],
    pattern: "One large star with four smaller stars in an arc on a red field.",
    meaning: "The design presents political unity as stars gathered on a red field.",
    memoryHook: "Remember one guiding star surrounded by four supporting stars.",
    geoContext: {
      location: "Large East Asian country spanning coast, river plains, deserts, plateaus, and mountains.",
      neighbors: ["India", "Russia", "Mongolia", "Vietnam", "Nepal", "Pakistan"],
      history: [
        "China borders more countries than almost any other state, which helps explain its many frontier regions.",
        "The Yellow and Yangtze river systems shaped dense settlement and imperial centers.",
        "Mountain and desert edges helped form historical borders with Central Asia, South Asia, and the steppe.",
      ],
    },
  },
  {
    code: "IN",
    name: "India",
    region: "Asia",
    subregion: "South Asia",
    flagUrl: flagUrl("IN"),
    relatedLinks: [
      {
        label: "Ashoka Chakra",
        url: "https://en.wikipedia.org/wiki/Ashoka_Chakra",
      },
    ],
    colors: [
      { name: "Saffron", hex: "#ff9933", meaning: "courage and sacrifice" },
      { name: "White", hex: "#ffffff", meaning: "truth and peace" },
      { name: "Green", hex: "#138808", meaning: "growth and fertility" },
      { name: "Navy", hex: "#000080", meaning: "the Ashoka Chakra, dharma, and lawful motion" },
    ],
    symbols: [
      {
        name: "Ashoka Chakra",
        meaning:
          "Ashoka's wheel: a navy-blue Dharmachakra connected to Ashokan symbols such as the Lion Capital of Ashoka.",
      },
      {
        name: "24 spokes",
        meaning:
          "The spokes turn the flag into a reminder of dharma, movement, and the idea that life is in motion rather than stagnation.",
      },
    ],
    pattern: "Horizontal saffron, white, and green bands with a 24-spoked navy Ashoka Chakra in the center.",
    meaning:
      "The tricolor joins sacrifice, peace, growth, and the Ashoka Chakra, which replaced the earlier spinning-wheel symbol in 1947 and carries the idea of dharma in motion.",
    memoryHook:
      "Remember India's flag by the wheel: not just a circle, but Ashoka's 24-spoked dharma wheel keeping the flag moving.",
    geoContext: {
      location: "South Asian peninsula between the Himalayas and the Indian Ocean.",
      neighbors: ["Pakistan", "China", "Nepal", "Bangladesh", "Bhutan", "Myanmar"],
      history: [
        "The Himalayas form a huge northern barrier while river plains connect many inland regions.",
        "The 1947 partition created modern borders with Pakistan and later Bangladesh.",
        "Ocean routes made India central to trade across the Arabian Sea and Bay of Bengal.",
      ],
    },
  },
  {
    code: "KR",
    name: "South Korea",
    region: "Asia",
    subregion: "East Asia",
    flagUrl: flagUrl("KR"),
    colors: [
      { name: "White", hex: "#ffffff", meaning: "peace and a traditional Korean color" },
      { name: "Red", hex: "#c60c30", meaning: "positive cosmic force" },
      { name: "Blue", hex: "#003478", meaning: "negative cosmic force in balance" },
      { name: "Black", hex: "#000000", meaning: "the four trigrams" },
    ],
    symbols: [
      { name: "Taegeuk", meaning: "balance of complementary forces" },
      { name: "Trigrams", meaning: "heaven, earth, water, and fire" },
    ],
    pattern: "A red-blue circle centered on white, surrounded by four black trigrams.",
    meaning: "The flag turns balance and natural order into a compact diagram.",
    memoryHook: "Think of the red-blue center as motion held in balance.",
    geoContext: {
      location: "Southern half of the Korean Peninsula, between China, Japan, and the Yellow Sea.",
      neighbors: ["North Korea"],
      history: [
        "The peninsula's location made it a cultural bridge and strategic borderland between China and Japan.",
        "The Demilitarized Zone marks the unresolved division after the Korean War.",
        "The flag's balance theme contrasts with a geography shaped by intense border tension.",
      ],
    },
  },
  {
    code: "NP",
    name: "Nepal",
    region: "Asia",
    subregion: "South Asia",
    flagUrl: flagUrl("NP"),
    colors: [
      { name: "Crimson", hex: "#dc143c", meaning: "national color and bravery" },
      { name: "Blue", hex: "#003893", meaning: "peace" },
      { name: "White", hex: "#ffffff", meaning: "the moon and sun" },
    ],
    symbols: [
      { name: "Moon", meaning: "calmness and permanence" },
      { name: "Sun", meaning: "resolve and permanence" },
    ],
    pattern: "Two stacked triangular pennants with moon and sun symbols.",
    meaning: "Nepal's flag keeps a pennant shape and links national endurance to celestial symbols.",
    memoryHook: "The only non-rectangular national flag points like Himalayan peaks.",
    geoContext: {
      location: "Himalayan state between India and China.",
      neighbors: ["India", "China"],
      history: [
        "Nepal's mountain geography helped preserve a distinct kingdom between larger neighbors.",
        "Mount Everest anchors the country's global geographic identity.",
        "The two pennants echo older South Asian flag traditions rather than the modern rectangle.",
      ],
    },
  },
  {
    code: "BT",
    name: "Bhutan",
    region: "Asia",
    subregion: "South Asia",
    flagUrl: flagUrl("BT"),
    colors: [
      { name: "Yellow", hex: "#ffd520", meaning: "civil authority and the monarchy" },
      { name: "Orange", hex: "#ff4e12", meaning: "Buddhist spiritual tradition" },
      { name: "White", hex: "#ffffff", meaning: "purity and the dragon" },
    ],
    symbols: [{ name: "Thunder dragon", meaning: "Druk, the national name and protective power" }],
    pattern: "A diagonal yellow-orange field with a white dragon across the center.",
    meaning: "The flag balances royal authority, Buddhist tradition, and Bhutan's dragon identity.",
    memoryHook: "Bhutan is the Land of the Thunder Dragon, so look for the dragon first.",
    geoContext: {
      location: "Eastern Himalayan kingdom between India and China.",
      neighbors: ["India", "China"],
      history: [
        "Mountain terrain helped Bhutan maintain independence between larger powers.",
        "Its northern frontier touches Tibet, while southern routes connect to India.",
        "The dragon symbol ties the flag directly to Bhutan's own name, Druk Yul.",
      ],
    },
  },
  {
    code: "SG",
    name: "Singapore",
    region: "Asia",
    subregion: "Southeast Asia",
    flagUrl: flagUrl("SG"),
    colors: [
      { name: "Red", hex: "#ef3340", meaning: "universal fellowship and equality" },
      { name: "White", hex: "#ffffff", meaning: "purity and virtue" },
    ],
    symbols: [
      { name: "Crescent", meaning: "a young nation rising" },
      { name: "Five stars", meaning: "democracy, peace, progress, justice, and equality" },
    ],
    pattern: "Red over white with a crescent and five stars at the upper hoist.",
    meaning: "The flag frames Singapore as a young, principled, multiethnic republic.",
    memoryHook: "A small island state uses a small crescent and five compact ideals.",
    geoContext: {
      location: "Island city-state at the southern tip of the Malay Peninsula.",
      neighbors: ["Malaysia", "Indonesia"],
      history: [
        "Its position on the Strait of Malacca made Singapore a major port and trade hub.",
        "Singapore separated from Malaysia in 1965, making the young-nation crescent easy to remember.",
        "Short sea crossings tie it closely to Malaysia and Indonesia.",
      ],
    },
  },
  {
    code: "ID",
    name: "Indonesia",
    region: "Asia",
    subregion: "Southeast Asia",
    flagUrl: flagUrl("ID"),
    colors: [
      { name: "Red", hex: "#ff0000", meaning: "courage" },
      { name: "White", hex: "#ffffff", meaning: "purity" },
    ],
    symbols: [],
    pattern: "Two horizontal bands: red over white.",
    meaning: "A simple bicolor links national identity to courage and purity.",
    memoryHook: "An archipelago of many islands is represented by two bold, simple bands.",
    geoContext: {
      location: "Huge archipelago between the Indian and Pacific Oceans.",
      neighbors: ["Malaysia", "Papua New Guinea", "Timor-Leste"],
      history: [
        "Indonesia's island geography made sea routes more important than land borders.",
        "The country shares the island of New Guinea with Papua New Guinea.",
        "Its red-white colors are connected to older regional symbolism and independence identity.",
      ],
    },
  },
  {
    code: "PH",
    name: "Philippines",
    region: "Asia",
    subregion: "Southeast Asia",
    flagUrl: flagUrl("PH"),
    colors: [
      { name: "Blue", hex: "#0038a8", meaning: "peace, truth, and justice" },
      { name: "Red", hex: "#ce1126", meaning: "patriotism and valor" },
      { name: "White", hex: "#ffffff", meaning: "liberty, equality, and fraternity" },
      { name: "Gold", hex: "#fcd116", meaning: "the sun and stars" },
    ],
    symbols: [
      { name: "Sun", meaning: "independence and eight provinces of revolt" },
      { name: "Three stars", meaning: "Luzon, Visayas, and Mindanao" },
    ],
    pattern: "Blue and red horizontal bands with a white triangle, sun, and three stars.",
    meaning: "The flag maps the islands and independence struggle into sun and stars.",
    memoryHook: "Three stars for the three island groups make the geography visible.",
    geoContext: {
      location: "Island nation east of Vietnam and north of Indonesia.",
      neighbors: ["Taiwan", "Vietnam", "Malaysia", "Indonesia"],
      history: [
        "Its islands sit on Pacific trade and migration routes.",
        "The three stars compress the country's main island groups into a flag memory cue.",
        "Colonial rule and revolution shaped the independence symbolism in the sun.",
      ],
    },
  },
  {
    code: "TH",
    name: "Thailand",
    region: "Asia",
    subregion: "Southeast Asia",
    flagUrl: flagUrl("TH"),
    colors: [
      { name: "Red", hex: "#a51931", meaning: "the nation and people" },
      { name: "White", hex: "#ffffff", meaning: "religion and purity" },
      { name: "Blue", hex: "#2d2a4a", meaning: "the monarchy" },
    ],
    symbols: [],
    pattern: "Five horizontal stripes, with a wider blue stripe in the center.",
    meaning: "The trairanga brings nation, religion, and monarchy into one balanced stripe pattern.",
    memoryHook: "The wide royal-blue center makes the monarchy visually central.",
    geoContext: {
      location: "Mainland Southeast Asian country between Myanmar, Laos, Cambodia, and Malaysia.",
      neighbors: ["Myanmar", "Laos", "Cambodia", "Malaysia"],
      history: [
        "Thailand sits between former British and French colonial spheres in mainland Southeast Asia.",
        "Its central plains and river systems helped support long-standing kingdoms.",
        "The flag's central stripe mirrors the monarchy's central role in national identity.",
      ],
    },
  },
  {
    code: "VN",
    name: "Vietnam",
    region: "Asia",
    subregion: "Southeast Asia",
    flagUrl: flagUrl("VN"),
    colors: [
      { name: "Red", hex: "#da251d", meaning: "revolution and sacrifice" },
      { name: "Yellow", hex: "#ffcd00", meaning: "the star and the people" },
    ],
    symbols: [{ name: "Five-pointed star", meaning: "workers, peasants, soldiers, intellectuals, and youth" }],
    pattern: "A yellow star centered on a red field.",
    meaning: "The flag uses one star to gather social groups under a revolutionary field.",
    memoryHook: "Vietnam's S-shaped coastline is easy to find; the flag is just as bold: one star on red.",
    geoContext: {
      location: "Long coastal country along the South China Sea.",
      neighbors: ["China", "Laos", "Cambodia"],
      history: [
        "Vietnam's northern border with China has been central to centuries of trade and conflict.",
        "The long coastline connected Vietnam to regional maritime networks.",
        "The red field and star reflect revolutionary politics and national unity.",
      ],
    },
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    region: "Asia",
    subregion: "Western Asia",
    flagUrl: flagUrl("SA"),
    colors: [
      { name: "Green", hex: "#006c35", meaning: "Islamic tradition" },
      { name: "White", hex: "#ffffff", meaning: "the shahada and sword" },
    ],
    symbols: [
      { name: "Shahada", meaning: "the Islamic declaration of faith" },
      { name: "Sword", meaning: "justice and strength" },
    ],
    pattern: "White Arabic script and a sword on a green field.",
    meaning: "The flag makes religion and state authority immediately visible.",
    memoryHook: "Green field plus Arabic script points straight to the Arabian Peninsula and Islam's birthplace.",
    geoContext: {
      location: "Largest country on the Arabian Peninsula.",
      neighbors: ["Jordan", "Iraq", "Kuwait", "Qatar", "United Arab Emirates", "Oman", "Yemen"],
      history: [
        "Mecca and Medina make Saudi Arabia central to Islamic geography.",
        "Desert interiors and coastal trade routes shaped settlement and political control.",
        "The sword beneath the text reinforces state authority tied to religious identity.",
      ],
    },
  },
  {
    code: "IL",
    name: "Israel",
    region: "Asia",
    subregion: "Western Asia",
    flagUrl: flagUrl("IL"),
    colors: [
      { name: "White", hex: "#ffffff", meaning: "the field inspired by a prayer shawl" },
      { name: "Blue", hex: "#0038b8", meaning: "stripes and the Star of David" },
    ],
    symbols: [{ name: "Star of David", meaning: "Jewish identity and heritage" }],
    pattern: "Blue stripes near the top and bottom with a blue Star of David in the center.",
    meaning: "The flag connects modern statehood with Jewish religious and cultural symbols.",
    memoryHook: "The blue stripes recall a tallit, placing the Star of David between them.",
    geoContext: {
      location: "Eastern Mediterranean country at the meeting point of Africa and Asia.",
      neighbors: ["Lebanon", "Syria", "Jordan", "Egypt"],
      history: [
        "Its location made the area a crossroads for empires, religions, and trade routes.",
        "Modern borders sit within a region shaped by Ottoman rule, British mandate history, and later wars.",
        "The flag's symbols connect geography to Jewish historical identity in the land.",
      ],
    },
  },
  {
    code: "FR",
    name: "France",
    region: "Europe",
    subregion: "Western Europe",
    flagUrl: flagUrl("FR"),
    colors: [
      { name: "Blue", hex: "#0055a4", meaning: "Paris and revolutionary civic identity" },
      { name: "White", hex: "#ffffff", meaning: "historic monarchy and national continuity" },
      { name: "Red", hex: "#ef4135", meaning: "Paris and revolutionary civic identity" },
    ],
    symbols: [],
    pattern: "Vertical blue, white, and red bands.",
    meaning: "The tricolor is tied to the French Revolution and a new civic nation.",
    memoryHook: "The French flag stands upright like a revolutionary banner: blue, white, red.",
    geoContext: {
      location: "Western European country with Atlantic, Mediterranean, and Alpine frontiers.",
      neighbors: ["Belgium", "Germany", "Switzerland", "Italy", "Spain"],
      history: [
        "France's borders touch several major European regions, which helped make it a continental power.",
        "The Alps and Pyrenees form natural borders with Italy, Switzerland, and Spain.",
        "The tricolor spread as a model for later revolutionary and republican flags.",
      ],
    },
  },
  {
    code: "DE",
    name: "Germany",
    region: "Europe",
    subregion: "Western Europe",
    flagUrl: flagUrl("DE"),
    colors: [
      { name: "Black", hex: "#000000", meaning: "historic democratic and nationalist colors" },
      { name: "Red", hex: "#dd0000", meaning: "liberty movements and unity" },
      { name: "Gold", hex: "#ffce00", meaning: "democratic tradition and unity" },
    ],
    symbols: [],
    pattern: "Horizontal black, red, and gold bands.",
    meaning: "The colors are strongly associated with German unity and democratic movements.",
    memoryHook: "Black-red-gold is the democracy/unity sequence for central Europe.",
    geoContext: {
      location: "Central European country linking North Sea plains, Rhine regions, and Alpine edges.",
      neighbors: ["France", "Poland", "Czechia", "Austria", "Netherlands", "Denmark"],
      history: [
        "Germany's central location explains its many borders and its role in European conflicts and integration.",
        "The Rhine has long connected German regions to France, the Netherlands, and trade routes.",
        "Black-red-gold gained meaning through nineteenth-century and later democratic movements.",
      ],
    },
  },
  {
    code: "IT",
    name: "Italy",
    region: "Europe",
    subregion: "Southern Europe",
    flagUrl: flagUrl("IT"),
    colors: [
      { name: "Green", hex: "#009246", meaning: "hope and the land" },
      { name: "White", hex: "#ffffff", meaning: "faith and snow-capped mountains" },
      { name: "Red", hex: "#ce2b37", meaning: "charity and sacrifice" },
    ],
    symbols: [],
    pattern: "Vertical green, white, and red bands.",
    meaning: "The tricolor is tied to Italian unification and regional revolutionary flags.",
    memoryHook: "Italy's boot is easy on the map; the flag is a vertical tricolor like France, but green leads.",
    geoContext: {
      location: "Mediterranean peninsula extending from the Alps toward North Africa.",
      neighbors: ["France", "Switzerland", "Austria", "Slovenia"],
      history: [
        "The Alps form Italy's northern arc and many of its land borders.",
        "The peninsula's shape made maritime trade central from Rome through the Renaissance.",
        "The tricolor became a unification symbol across formerly separate states.",
      ],
    },
  },
  {
    code: "ES",
    name: "Spain",
    region: "Europe",
    subregion: "Southern Europe",
    flagUrl: flagUrl("ES"),
    colors: [
      { name: "Red", hex: "#aa151b", meaning: "historic Spanish colors" },
      { name: "Yellow", hex: "#f1bf00", meaning: "visibility at sea and historic arms" },
    ],
    symbols: [{ name: "Coat of arms", meaning: "historic kingdoms and constitutional monarchy" }],
    pattern: "Red-yellow-red horizontal bands with the coat of arms near the hoist.",
    meaning: "The flag combines high-visibility naval colors with symbols of Spain's kingdoms.",
    memoryHook: "The wide yellow middle stripe stands out like sunlight over Iberia.",
    geoContext: {
      location: "Iberian Peninsula country between the Atlantic Ocean and Mediterranean Sea.",
      neighbors: ["Portugal", "France", "Andorra", "Morocco"],
      history: [
        "The Pyrenees create a strong natural border with France.",
        "Spain's Mediterranean and Atlantic coasts supported exploration and empire.",
        "The coat of arms records older kingdoms joined into modern Spain.",
      ],
    },
  },
  {
    code: "GB",
    name: "United Kingdom",
    region: "Europe",
    subregion: "Northern Europe",
    flagUrl: flagUrl("GB"),
    colors: [
      { name: "Red", hex: "#c8102e", meaning: "crosses of England and Ireland" },
      { name: "White", hex: "#ffffff", meaning: "fields and diagonal separation" },
      { name: "Blue", hex: "#012169", meaning: "field of Scotland's Saltire" },
    ],
    symbols: [
      { name: "Union crosses", meaning: "combined crosses of England, Scotland, and Ireland" },
    ],
    pattern: "Layered red and white crosses on a blue field.",
    meaning: "The Union Flag stacks the patron-saint crosses of multiple kingdoms.",
    memoryHook: "It looks busy because it is literally several flags layered into one union.",
    geoContext: {
      location: "Island state off northwestern Europe.",
      neighbors: ["Ireland", "France", "Belgium", "Netherlands"],
      history: [
        "The English Channel separated Britain from continental Europe while still keeping it close to trade and war.",
        "The flag reflects political union across England, Scotland, and Ireland's historical relationship.",
        "Its island geography supported naval power and global empire.",
      ],
    },
  },
  {
    code: "GR",
    name: "Greece",
    region: "Europe",
    subregion: "Southeastern Europe",
    flagUrl: flagUrl("GR"),
    colors: [
      { name: "Blue", hex: "#0d5eaf", meaning: "sea and sky" },
      { name: "White", hex: "#ffffff", meaning: "waves and purity" },
    ],
    symbols: [{ name: "Cross", meaning: "Greek Orthodox Christianity" }],
    pattern: "Nine blue-white stripes with a white cross on a blue canton.",
    meaning: "The flag ties sea geography, independence identity, and Orthodox tradition together.",
    memoryHook: "Think Aegean blue and island-white buildings, then add the cross.",
    geoContext: {
      location: "Southeastern European peninsula and island country in the Aegean and Ionian seas.",
      neighbors: ["Albania", "North Macedonia", "Bulgaria", "Turkey"],
      history: [
        "Greek geography is deeply maritime, with many islands shaping identity and trade.",
        "The land border with Turkey reflects a long Greek-Ottoman historical frontier.",
        "The cross points to the Orthodox tradition that mattered in independence struggles.",
      ],
    },
  },
  {
    code: "SE",
    name: "Sweden",
    region: "Europe",
    subregion: "Northern Europe",
    flagUrl: flagUrl("SE"),
    colors: [
      { name: "Blue", hex: "#006aa7", meaning: "historic Swedish arms and sky" },
      { name: "Yellow", hex: "#fecc00", meaning: "historic Swedish arms and the cross" },
    ],
    symbols: [{ name: "Nordic cross", meaning: "Christian heritage and Nordic flag family" }],
    pattern: "Yellow Nordic cross shifted toward the hoist on a blue field.",
    meaning: "The flag places Sweden inside the Nordic cross tradition.",
    memoryHook: "Blue and yellow are Sweden's national colors; the sideways cross says Nordic.",
    geoContext: {
      location: "Scandinavian country on the Baltic Sea, west of Finland.",
      neighbors: ["Norway", "Finland"],
      history: [
        "Sweden shares a long Scandinavian land border with Norway and a Baltic connection to Finland.",
        "Nordic cross flags visually link Sweden with Denmark, Norway, Finland, and Iceland.",
        "The Baltic Sea shaped Swedish trade and past regional power.",
      ],
    },
  },
  {
    code: "NO",
    name: "Norway",
    region: "Europe",
    subregion: "Northern Europe",
    flagUrl: flagUrl("NO"),
    colors: [
      { name: "Red", hex: "#ba0c2f", meaning: "Nordic and historical flag tradition" },
      { name: "White", hex: "#ffffff", meaning: "cross separation" },
      { name: "Blue", hex: "#00205b", meaning: "independence-era link to liberal tricolors" },
    ],
    symbols: [{ name: "Nordic cross", meaning: "Christian heritage and Nordic identity" }],
    pattern: "Blue Nordic cross outlined in white on a red field.",
    meaning: "Norway combines the Nordic cross with colors echoing democratic tricolors.",
    memoryHook: "A red Nordic flag with a blue cross fits Norway's coastline beside the North Atlantic.",
    geoContext: {
      location: "Long mountainous country on the western side of Scandinavia.",
      neighbors: ["Sweden", "Finland", "Russia"],
      history: [
        "Norway's long coast and fjords made seafaring central to its history.",
        "The land border with Sweden reflects centuries of Scandinavian unions and separation.",
        "The Nordic cross connects Norway to its regional flag family.",
      ],
    },
  },
  {
    code: "CH",
    name: "Switzerland",
    region: "Europe",
    subregion: "Western Europe",
    flagUrl: flagUrl("CH"),
    colors: [
      { name: "Red", hex: "#ff0000", meaning: "historic Swiss field" },
      { name: "White", hex: "#ffffff", meaning: "the cross" },
    ],
    symbols: [{ name: "White cross", meaning: "Swiss confederation and neutrality associations" }],
    pattern: "A white cross centered on a red square field.",
    meaning: "The square flag uses a simple cross to mark confederation identity.",
    memoryHook: "Square, neutral, Alpine: the Swiss flag is as compact as the country on the map.",
    geoContext: {
      location: "Alpine country in central-western Europe.",
      neighbors: ["France", "Germany", "Italy", "Austria", "Liechtenstein"],
      history: [
        "The Alps shaped Swiss defense, cantonal identity, and neutrality.",
        "Switzerland sits between major language regions: German, French, Italian, and Romansh.",
        "Its small, square flag is visually distinct like its unusual political geography.",
      ],
    },
  },
  {
    code: "IE",
    name: "Ireland",
    region: "Europe",
    subregion: "Northern Europe",
    flagUrl: flagUrl("IE"),
    colors: [
      { name: "Green", hex: "#169b62", meaning: "Irish nationalist and Gaelic tradition" },
      { name: "White", hex: "#ffffff", meaning: "peace between communities" },
      { name: "Orange", hex: "#ff883e", meaning: "Protestant and Williamite tradition" },
    ],
    symbols: [],
    pattern: "Vertical green, white, and orange bands.",
    meaning: "The tricolor expresses hope for peace between major Irish communities.",
    memoryHook: "Green and orange stand apart, with white peace between them.",
    geoContext: {
      location: "Island in the North Atlantic, west of Great Britain.",
      neighbors: ["United Kingdom"],
      history: [
        "Ireland shares the island with Northern Ireland, which remains part of the United Kingdom.",
        "The border reflects partition in the early twentieth century.",
        "The white stripe's peace meaning is easier to remember once the island's divided history is visible.",
      ],
    },
  },
  {
    code: "PL",
    name: "Poland",
    region: "Europe",
    subregion: "Eastern Europe",
    flagUrl: flagUrl("PL"),
    colors: [
      { name: "White", hex: "#ffffff", meaning: "the white eagle and national arms" },
      { name: "Red", hex: "#dc143c", meaning: "the shield field and national struggle" },
    ],
    symbols: [],
    pattern: "Two horizontal bands: white over red.",
    meaning: "The colors come from Poland's historic white eagle on a red shield.",
    memoryHook: "White eagle above red shield becomes white stripe above red stripe.",
    geoContext: {
      location: "Central-eastern European country on the North European Plain.",
      neighbors: ["Germany", "Czechia", "Slovakia", "Ukraine", "Belarus", "Lithuania", "Russia"],
      history: [
        "Poland's flat geography between Germany and Russia made borders shift repeatedly.",
        "Partitions by neighboring empires erased Poland from the map before modern restoration.",
        "The simple bicolor compresses an older coat of arms into two bands.",
      ],
    },
  },
  {
    code: "UA",
    name: "Ukraine",
    region: "Europe",
    subregion: "Eastern Europe",
    flagUrl: flagUrl("UA"),
    colors: [
      { name: "Blue", hex: "#0057b7", meaning: "sky and national tradition" },
      { name: "Yellow", hex: "#ffd700", meaning: "wheat fields and national tradition" },
    ],
    symbols: [],
    pattern: "Two horizontal bands: blue over yellow.",
    meaning: "A common reading sees blue sky over golden wheat fields.",
    memoryHook: "Ukraine is famous for grain; remember sky over wheat.",
    geoContext: {
      location: "Large Eastern European country north of the Black Sea.",
      neighbors: ["Poland", "Slovakia", "Hungary", "Romania", "Moldova", "Belarus", "Russia"],
      history: [
        "Ukraine's steppe and rich farmland made it a vital grain region.",
        "Its name is often associated with borderland history between empires and states.",
        "The Black Sea coast and eastern frontier have been central in modern conflict and identity.",
      ],
    },
  },
  {
    code: "CZ",
    name: "Czechia",
    region: "Europe",
    subregion: "Eastern Europe",
    flagUrl: flagUrl("CZ"),
    colors: [
      { name: "White", hex: "#ffffff", meaning: "Bohemian arms and Slavic colors" },
      { name: "Red", hex: "#d7141a", meaning: "Bohemian arms and Slavic colors" },
      { name: "Blue", hex: "#11457e", meaning: "Moravia/Slovakia distinction in the former Czechoslovak flag" },
    ],
    symbols: [],
    pattern: "White over red horizontal bands with a blue triangle at the hoist.",
    meaning: "The flag adapts Bohemian red-white with a blue triangle from Czechoslovak identity.",
    memoryHook: "The blue wedge keeps Czechia from looking like Poland.",
    geoContext: {
      location: "Landlocked country in central Europe, historically Bohemia and Moravia.",
      neighbors: ["Germany", "Poland", "Slovakia", "Austria"],
      history: [
        "Czechia sits inside a ring of mountains and uplands that shaped Bohemia's borders.",
        "The peaceful split of Czechoslovakia in 1993 left Czechia with the former federal flag.",
        "Its central position links Germanic and Slavic historical regions.",
      ],
    },
  },
  {
    code: "RO",
    name: "Romania",
    region: "Europe",
    subregion: "Eastern Europe",
    flagUrl: flagUrl("RO"),
    colors: [
      { name: "Blue", hex: "#002b7f", meaning: "liberty" },
      { name: "Yellow", hex: "#fcd116", meaning: "justice" },
      { name: "Red", hex: "#ce1126", meaning: "fraternity" },
    ],
    symbols: [],
    pattern: "Vertical blue, yellow, and red bands.",
    meaning: "The tricolor joins modern civic ideals with Romanian national colors.",
    memoryHook: "Romania's blue-yellow-red resembles a vertical bridge between eastern and western Europe.",
    geoContext: {
      location: "Eastern European country around the Carpathians and lower Danube.",
      neighbors: ["Ukraine", "Moldova", "Bulgaria", "Serbia", "Hungary"],
      history: [
        "The Carpathian arc and Danube River strongly shape Romania's map.",
        "Romania borders Moldova, a closely related Romanian-speaking neighbor with a separate Soviet-era history.",
        "The tricolor belongs to the wider family of nineteenth-century European national flags.",
      ],
    },
  },
  {
    code: "RS",
    name: "Serbia",
    region: "Europe",
    subregion: "Southeastern Europe",
    flagUrl: flagUrl("RS"),
    colors: [
      { name: "Red", hex: "#c6363c", meaning: "Pan-Slavic tradition" },
      { name: "Blue", hex: "#0c4076", meaning: "Pan-Slavic tradition" },
      { name: "White", hex: "#ffffff", meaning: "Pan-Slavic tradition" },
    ],
    symbols: [{ name: "Coat of arms", meaning: "Serbian statehood and double-headed eagle tradition" }],
    pattern: "Red, blue, and white horizontal bands with arms near the hoist.",
    meaning: "The flag uses Pan-Slavic colors with a historic Serbian coat of arms.",
    memoryHook: "Red-blue-white links Serbia to Slavic flag families; the eagle marks state history.",
    geoContext: {
      location: "Landlocked Balkan country on routes between central and southeastern Europe.",
      neighbors: ["Hungary", "Romania", "Bulgaria", "North Macedonia", "Croatia", "Bosnia and Herzegovina", "Montenegro"],
      history: [
        "Serbia's Balkan location places it among many close borders and overlapping histories.",
        "The breakup of Yugoslavia reshaped several of Serbia's modern borders.",
        "Pan-Slavic colors help connect the flag to wider Slavic identity.",
      ],
    },
  },
  {
    code: "HR",
    name: "Croatia",
    region: "Europe",
    subregion: "Southeastern Europe",
    flagUrl: flagUrl("HR"),
    colors: [
      { name: "Red", hex: "#ff0000", meaning: "Pan-Slavic tradition" },
      { name: "White", hex: "#ffffff", meaning: "Pan-Slavic tradition and checkerboard shield" },
      { name: "Blue", hex: "#171796", meaning: "Pan-Slavic tradition and Adriatic identity" },
    ],
    symbols: [{ name: "Checkerboard shield", meaning: "historic Croatian arms" }],
    pattern: "Red, white, and blue horizontal bands with a central checkerboard coat of arms.",
    meaning: "Croatia combines Pan-Slavic colors with its distinctive checked shield.",
    memoryHook: "If you see a red-white checkerboard, think Croatia's Adriatic coastline.",
    geoContext: {
      location: "Balkan and Adriatic country curving around Bosnia and Herzegovina.",
      neighbors: ["Slovenia", "Hungary", "Serbia", "Bosnia and Herzegovina", "Montenegro"],
      history: [
        "Croatia's long Adriatic coast and inland borders create a distinctive crescent shape.",
        "Its modern borders were shaped by Yugoslavia's breakup and older Habsburg-Ottoman frontiers.",
        "The checkerboard arms make the flag easier to separate from other red-white-blue Slavic flags.",
      ],
    },
  },
  {
    code: "ZA",
    name: "South Africa",
    region: "Africa",
    subregion: "Southern Africa",
    flagUrl: flagUrl("ZA"),
    colors: [
      { name: "Black", hex: "#000000", meaning: "one part of the country's people and history" },
      { name: "Green", hex: "#007a4d", meaning: "the converging path" },
      { name: "Gold", hex: "#ffb612", meaning: "resources and historic symbolism" },
      { name: "White", hex: "#ffffff", meaning: "one part of the country's people and history" },
      { name: "Red", hex: "#de3831", meaning: "historic flag colors" },
      { name: "Blue", hex: "#002395", meaning: "historic flag colors" },
    ],
    symbols: [{ name: "Y-shape", meaning: "diverse elements converging into one path" }],
    pattern: "A green Y-shape bordered by white and gold, with black, red, and blue fields.",
    meaning: "The post-apartheid flag visualizes convergence after division.",
    memoryHook: "The Y is a road junction: many histories meeting in one country.",
    geoContext: {
      location: "Southern tip of Africa, between the Atlantic and Indian Oceans.",
      neighbors: ["Namibia", "Botswana", "Zimbabwe", "Mozambique", "Eswatini", "Lesotho"],
      history: [
        "South Africa surrounds Lesotho, making geography and borders especially memorable.",
        "The 1994 flag marks the transition from apartheid to democratic rule.",
        "Ocean routes around the Cape made the region globally strategic.",
      ],
    },
  },
  {
    code: "KE",
    name: "Kenya",
    region: "Africa",
    subregion: "Eastern Africa",
    flagUrl: flagUrl("KE"),
    colors: [
      { name: "Black", hex: "#000000", meaning: "the people" },
      { name: "Red", hex: "#bb0000", meaning: "blood shed in the struggle for independence" },
      { name: "Green", hex: "#006600", meaning: "the land" },
      { name: "White", hex: "#ffffff", meaning: "peace and honesty" },
    ],
    symbols: [{ name: "Shield and spears", meaning: "defense of freedom" }],
    pattern: "Black, red, and green bands separated by white lines, with a shield and spears.",
    meaning: "The flag links land, people, independence struggle, and defense.",
    memoryHook: "The central shield turns the flag into a reminder of protected independence.",
    geoContext: {
      location: "East African country on the Indian Ocean and equator.",
      neighbors: ["Tanzania", "Uganda", "South Sudan", "Ethiopia", "Somalia"],
      history: [
        "Kenya's coast connected East Africa to Indian Ocean trade networks.",
        "The shield references local cultural forms while marking national defense.",
        "Its equatorial location and Rift Valley geography are key map anchors.",
      ],
    },
  },
  {
    code: "NG",
    name: "Nigeria",
    region: "Africa",
    subregion: "Western Africa",
    flagUrl: flagUrl("NG"),
    colors: [
      { name: "Green", hex: "#008753", meaning: "agriculture and natural wealth" },
      { name: "White", hex: "#ffffff", meaning: "peace and unity" },
    ],
    symbols: [],
    pattern: "Vertical green, white, and green bands.",
    meaning: "The flag places peace between two green bands of land and resources.",
    memoryHook: "Green-white-green: fertile land on both sides of a peace stripe.",
    geoContext: {
      location: "West African country on the Gulf of Guinea.",
      neighbors: ["Benin", "Niger", "Chad", "Cameroon"],
      history: [
        "Nigeria's borders join many ethnic and language regions into one large state.",
        "The Niger River helps anchor the country's name and geography.",
        "The simple green-white design suits a country strongly associated with land and population scale.",
      ],
    },
  },
  {
    code: "GH",
    name: "Ghana",
    region: "Africa",
    subregion: "Western Africa",
    flagUrl: flagUrl("GH"),
    colors: [
      { name: "Red", hex: "#ce1126", meaning: "sacrifice in the independence struggle" },
      { name: "Gold", hex: "#fcd116", meaning: "mineral wealth" },
      { name: "Green", hex: "#006b3f", meaning: "forests and natural wealth" },
      { name: "Black", hex: "#000000", meaning: "African emancipation and the Black Star" },
    ],
    symbols: [{ name: "Black star", meaning: "African freedom and unity" }],
    pattern: "Red, gold, and green horizontal bands with a black star centered.",
    meaning: "The flag became a Pan-African model after independence.",
    memoryHook: "Ghana's black star is the visual anchor; it even appears in national nicknames.",
    geoContext: {
      location: "West African country on the Gulf of Guinea.",
      neighbors: ["Côte d'Ivoire", "Burkina Faso", "Togo"],
      history: [
        "Ghana was the first sub-Saharan African colony to gain independence in the postwar wave.",
        "The black star turned the flag into a symbol beyond Ghana itself.",
        "Gold Coast history makes the gold stripe especially easy to remember.",
      ],
    },
  },
  {
    code: "ET",
    name: "Ethiopia",
    region: "Africa",
    subregion: "Eastern Africa",
    flagUrl: flagUrl("ET"),
    colors: [
      { name: "Green", hex: "#078930", meaning: "land and hope" },
      { name: "Yellow", hex: "#fcd116", meaning: "peace and harmony" },
      { name: "Red", hex: "#da121a", meaning: "strength and sacrifice" },
      { name: "Blue", hex: "#0f47af", meaning: "peace in the emblem" },
    ],
    symbols: [{ name: "Star emblem", meaning: "unity and equality among Ethiopia's peoples" }],
    pattern: "Green, yellow, and red bands with a blue disc and star emblem.",
    meaning: "Ethiopia's colors influenced many later Pan-African flags.",
    memoryHook: "Many African flags echo Ethiopia's green-yellow-red because Ethiopia stayed independent for so long.",
    geoContext: {
      location: "Horn of Africa country with highlands near the Red Sea region.",
      neighbors: ["Eritrea", "Djibouti", "Somalia", "Kenya", "South Sudan", "Sudan"],
      history: [
        "Ethiopia's highlands supported one of Africa's oldest continuous state traditions.",
        "Its resistance to long-term colonization gave its colors continental symbolism.",
        "The Eritrean coast's separation left Ethiopia landlocked after Eritrean independence.",
      ],
    },
  },
  {
    code: "MA",
    name: "Morocco",
    region: "Africa",
    subregion: "Northern Africa",
    flagUrl: flagUrl("MA"),
    colors: [
      { name: "Red", hex: "#c1272d", meaning: "the ruling dynasty and bravery" },
      { name: "Green", hex: "#006233", meaning: "Islam and the pentagram" },
    ],
    symbols: [{ name: "Green pentagram", meaning: "the Seal of Solomon and protection" }],
    pattern: "A green five-pointed star centered on a red field.",
    meaning: "The flag combines dynastic red with an Islamic green protective symbol.",
    memoryHook: "Morocco sits at Africa's northwest gate; remember the green star on red.",
    geoContext: {
      location: "Northwest African country on the Atlantic and Mediterranean, near the Strait of Gibraltar.",
      neighbors: ["Algeria", "Western Sahara", "Spain"],
      history: [
        "The Strait of Gibraltar connects Morocco closely to Spain and Europe.",
        "Morocco's position made it a crossroads of Arab, Amazigh, African, and European histories.",
        "The red field and green star make a simple symbol set tied to monarchy and Islam.",
      ],
    },
  },
  {
    code: "EG",
    name: "Egypt",
    region: "Africa",
    subregion: "Northern Africa",
    flagUrl: flagUrl("EG"),
    colors: [
      { name: "Red", hex: "#ce1126", meaning: "struggle and sacrifice" },
      { name: "White", hex: "#ffffff", meaning: "peaceful revolution and hope" },
      { name: "Black", hex: "#000000", meaning: "the end of oppression" },
      { name: "Gold", hex: "#c09300", meaning: "the Eagle of Saladin" },
    ],
    symbols: [{ name: "Eagle of Saladin", meaning: "Arab identity and state authority" }],
    pattern: "Red, white, and black horizontal bands with a gold eagle in the center.",
    meaning: "The flag uses Arab liberation colors and a central eagle of authority.",
    memoryHook: "The Nile country uses a strong central eagle between red-white-black bands.",
    geoContext: {
      location: "Northeast African country linking Africa and Asia through Sinai.",
      neighbors: ["Libya", "Sudan", "Israel", "Palestinian territories"],
      history: [
        "The Nile is Egypt's defining geographic line through desert.",
        "The Sinai Peninsula makes Egypt a land bridge between Africa and Asia.",
        "Arab liberation colors connect Egypt's modern flag to regional twentieth-century politics.",
      ],
    },
  },
  {
    code: "US",
    name: "United States",
    region: "Americas",
    subregion: "Northern America",
    flagUrl: flagUrl("US"),
    colors: [
      { name: "Red", hex: "#b22234", meaning: "valor and hardiness" },
      { name: "White", hex: "#ffffff", meaning: "purity and innocence" },
      { name: "Blue", hex: "#3c3b6e", meaning: "vigilance, perseverance, and justice" },
    ],
    symbols: [
      { name: "Stars", meaning: "the states" },
      { name: "Stripes", meaning: "the original thirteen colonies" },
    ],
    pattern: "Thirteen red-white stripes with fifty white stars on a blue canton.",
    meaning: "The flag turns federal structure and founding colonies into a countable pattern.",
    memoryHook: "Count the idea: 13 stripes for origins, 50 stars for current states.",
    geoContext: {
      location: "Large North American country between Canada, Mexico, Atlantic, and Pacific coasts.",
      neighbors: ["Canada", "Mexico"],
      history: [
        "The long Canada-US border is often described as the world's longest international land border.",
        "The original colonies were on the Atlantic coast, explaining the stripe count.",
        "Westward expansion made the star field grow over time.",
      ],
    },
  },
  {
    code: "CA",
    name: "Canada",
    region: "Americas",
    subregion: "Northern America",
    flagUrl: flagUrl("CA"),
    colors: [
      { name: "Red", hex: "#ff0000", meaning: "Canadian national color and side bars" },
      { name: "White", hex: "#ffffff", meaning: "snow and central field" },
    ],
    symbols: [{ name: "Maple leaf", meaning: "Canadian nature and national identity" }],
    pattern: "Red side bars with a red maple leaf centered on white.",
    meaning: "The flag uses one natural symbol to stand for the country clearly.",
    memoryHook: "Canada is huge and northern; the single maple leaf is the shortcut.",
    geoContext: {
      location: "Northern North American country spanning Atlantic, Pacific, and Arctic coasts.",
      neighbors: ["United States"],
      history: [
        "Canada's border with the United States structures much of its population and trade geography.",
        "The maple leaf became a widely recognized symbol before the modern flag was adopted.",
        "Arctic geography gives Canada vast northern territory with sparse settlement.",
      ],
    },
  },
  {
    code: "MX",
    name: "Mexico",
    region: "Americas",
    subregion: "Central America",
    flagUrl: flagUrl("MX"),
    colors: [
      { name: "Green", hex: "#006847", meaning: "hope" },
      { name: "White", hex: "#ffffff", meaning: "unity" },
      { name: "Red", hex: "#ce1126", meaning: "national heroes' blood" },
    ],
    symbols: [{ name: "Eagle, cactus, and snake", meaning: "foundation legend of Tenochtitlan" }],
    pattern: "Vertical green, white, and red bands with the national arms in the center.",
    meaning: "The central emblem ties the modern state to an Aztec foundation story.",
    memoryHook: "Eagle on cactus equals Mexico City origin story.",
    geoContext: {
      location: "Country between the United States, Central America, the Pacific, and Gulf of Mexico.",
      neighbors: ["United States", "Guatemala", "Belize"],
      history: [
        "Mexico links North America and Central America both geographically and historically.",
        "The eagle-cactus emblem points to the founding story of Tenochtitlan, now Mexico City.",
        "The US-Mexico border reflects nineteenth-century war, treaties, and migration history.",
      ],
    },
  },
  {
    code: "BR",
    name: "Brazil",
    region: "Americas",
    subregion: "South America",
    flagUrl: flagUrl("BR"),
    colors: [
      { name: "Green", hex: "#009c3b", meaning: "imperial house and forests in common interpretation" },
      { name: "Yellow", hex: "#ffdf00", meaning: "imperial house and mineral wealth in common interpretation" },
      { name: "Blue", hex: "#002776", meaning: "sky over Rio de Janeiro at the republic's proclamation" },
      { name: "White", hex: "#ffffff", meaning: "stars and motto band" },
    ],
    symbols: [
      { name: "Starry globe", meaning: "states and the sky at the republic's proclamation" },
      { name: "Motto", meaning: "Order and Progress" },
    ],
    pattern: "Yellow diamond on green with a blue starry globe and white motto band.",
    meaning: "Brazil's flag blends imperial colors, republican sky, states, and a national motto.",
    memoryHook: "The diamond and globe are as big and distinctive as Brazil is on the map.",
    geoContext: {
      location: "Largest country in South America, covering much of the Amazon basin and Atlantic coast.",
      neighbors: ["Argentina", "Bolivia", "Colombia", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"],
      history: [
        "Brazil borders nearly every South American country except Chile and Ecuador.",
        "Portuguese colonial history explains why Brazil speaks Portuguese while most neighbors speak Spanish.",
        "The Amazon basin is central to Brazil's geography and global identity.",
      ],
    },
  },
  {
    code: "AR",
    name: "Argentina",
    region: "Americas",
    subregion: "South America",
    flagUrl: flagUrl("AR"),
    colors: [
      { name: "Sky blue", hex: "#74acdf", meaning: "sky and national colors" },
      { name: "White", hex: "#ffffff", meaning: "clouds and national colors" },
      { name: "Gold", hex: "#f6b40e", meaning: "the Sun of May" },
    ],
    symbols: [{ name: "Sun of May", meaning: "May Revolution and independence" }],
    pattern: "Sky blue, white, and sky blue horizontal bands with a golden sun.",
    meaning: "The flag links open sky colors with the independence-era Sun of May.",
    memoryHook: "Argentina's wide pampas and big sky match the sky-blue bands.",
    geoContext: {
      location: "Southern South American country stretching from the Andes to the Atlantic.",
      neighbors: ["Chile", "Bolivia", "Paraguay", "Brazil", "Uruguay"],
      history: [
        "The Andes form Argentina's long western border with Chile.",
        "The pampas helped shape cattle, grain, and settlement patterns.",
        "The Sun of May ties the flag to independence movements around the Río de la Plata.",
      ],
    },
  },
  {
    code: "CL",
    name: "Chile",
    region: "Americas",
    subregion: "South America",
    flagUrl: flagUrl("CL"),
    colors: [
      { name: "Blue", hex: "#0039a6", meaning: "sky and Pacific" },
      { name: "White", hex: "#ffffff", meaning: "Andean snow" },
      { name: "Red", hex: "#d52b1e", meaning: "blood shed for independence" },
    ],
    symbols: [{ name: "White star", meaning: "guidance and honor" }],
    pattern: "A blue canton with a white star, white upper band, and red lower band.",
    meaning: "Chile's flag maps sky, Andes snow, and independence sacrifice into a clean pattern.",
    memoryHook: "Chile is a long strip between Andes and Pacific; white snow above red land is easy to picture.",
    geoContext: {
      location: "Long narrow country along South America's Pacific coast.",
      neighbors: ["Peru", "Bolivia", "Argentina"],
      history: [
        "The Andes form Chile's long border with Argentina.",
        "The Atacama Desert and Pacific coast make Chile geographically narrow and distinctive.",
        "Historical disputes with Bolivia and Peru shaped parts of Chile's northern border.",
      ],
    },
  },
  {
    code: "CO",
    name: "Colombia",
    region: "Americas",
    subregion: "South America",
    flagUrl: flagUrl("CO"),
    colors: [
      { name: "Yellow", hex: "#fcd116", meaning: "wealth and the larger top band" },
      { name: "Blue", hex: "#003893", meaning: "seas and rivers" },
      { name: "Red", hex: "#ce1126", meaning: "sacrifice in independence" },
    ],
    symbols: [],
    pattern: "A wide yellow band over narrower blue and red bands.",
    meaning: "The flag shares Gran Colombia colors while giving yellow extra weight.",
    memoryHook: "Yellow takes half the flag, just as Colombia sits prominently at South America's northwest corner.",
    geoContext: {
      location: "Northwestern South America, with Caribbean and Pacific coasts.",
      neighbors: ["Panama", "Venezuela", "Brazil", "Peru", "Ecuador"],
      history: [
        "Colombia's position links South America to Central America through Panama.",
        "The flag colors connect Colombia to the legacy of Gran Colombia with Ecuador and Venezuela.",
        "Two ocean coasts made geography unusually varied for a single South American country.",
      ],
    },
  },
  {
    code: "JM",
    name: "Jamaica",
    region: "Americas",
    subregion: "Caribbean",
    flagUrl: flagUrl("JM"),
    colors: [
      { name: "Black", hex: "#000000", meaning: "strength and creativity of the people" },
      { name: "Gold", hex: "#fed100", meaning: "sunshine and natural wealth" },
      { name: "Green", hex: "#009b3a", meaning: "land and hope" },
    ],
    symbols: [{ name: "Saltire", meaning: "a bold diagonal division unique among many national flags" }],
    pattern: "Gold diagonal cross dividing black and green triangles.",
    meaning: "The flag turns sunshine, land, and resilient people into a striking saltire.",
    memoryHook: "Gold X marks a Caribbean island of sunshine and green hills.",
    geoContext: {
      location: "Caribbean island south of Cuba and west of Hispaniola.",
      neighbors: ["Cuba", "Haiti", "Dominican Republic"],
      history: [
        "Jamaica's island geography shaped plantation, colonial, and maritime history.",
        "The flag was adopted at independence from the United Kingdom in 1962.",
        "The diagonal gold cross makes the flag instantly recognizable in the Caribbean set.",
      ],
    },
  },
  {
    code: "AU",
    name: "Australia",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    flagUrl: flagUrl("AU"),
    colors: [
      { name: "Blue", hex: "#00008b", meaning: "field of the Blue Ensign tradition" },
      { name: "White", hex: "#ffffff", meaning: "stars and Union Flag details" },
      { name: "Red", hex: "#ff0000", meaning: "Union Flag details" },
    ],
    symbols: [
      { name: "Union Flag", meaning: "British colonial history" },
      { name: "Commonwealth Star", meaning: "Australian federation" },
      { name: "Southern Cross", meaning: "southern hemisphere location" },
    ],
    pattern: "Blue field with Union Flag, Commonwealth Star, and Southern Cross.",
    meaning: "The flag combines colonial origin, federation, and southern sky geography.",
    memoryHook: "Find Australia under the Southern Cross; the flag literally shows it.",
    geoContext: {
      location: "Continental country between the Indian and Pacific Oceans.",
      neighbors: ["Indonesia", "Papua New Guinea", "Timor-Leste", "New Zealand"],
      history: [
        "Australia's isolation and scale make it the core landmass of Oceania.",
        "The Union Flag points to British colonization and federation history.",
        "The Southern Cross connects the flag to nighttime navigation in the southern hemisphere.",
      ],
    },
  },
  {
    code: "NZ",
    name: "New Zealand",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    flagUrl: flagUrl("NZ"),
    colors: [
      { name: "Blue", hex: "#00247d", meaning: "field of the Blue Ensign tradition and sea" },
      { name: "Red", hex: "#cc142b", meaning: "Southern Cross stars and Union Flag detail" },
      { name: "White", hex: "#ffffff", meaning: "star borders and Union Flag detail" },
    ],
    symbols: [
      { name: "Union Flag", meaning: "British colonial history" },
      { name: "Southern Cross", meaning: "southern hemisphere location" },
    ],
    pattern: "Blue field with Union Flag and four red-white Southern Cross stars.",
    meaning: "The flag links British history with New Zealand's southern sky position.",
    memoryHook: "Australia has white stars plus a big federation star; New Zealand has red stars.",
    geoContext: {
      location: "Island country in the southwest Pacific, southeast of Australia.",
      neighbors: ["Australia", "Fiji", "Tonga"],
      history: [
        "New Zealand's distance from Australia makes its island geography central to identity.",
        "The Treaty of Waitangi and British colonization shaped modern state history.",
        "The Southern Cross helps locate the country in the southern hemisphere.",
      ],
    },
  },
  {
    code: "FJ",
    name: "Fiji",
    region: "Oceania",
    subregion: "Melanesia",
    flagUrl: flagUrl("FJ"),
    colors: [
      { name: "Light blue", hex: "#68bfe5", meaning: "Pacific Ocean" },
      { name: "Red, white, and blue", hex: "#012169", meaning: "Union Flag colonial history" },
    ],
    symbols: [
      { name: "Union Flag", meaning: "British colonial history" },
      { name: "Shield", meaning: "local agriculture, sea, and heritage symbols" },
    ],
    pattern: "Light blue field with Union Flag and shield.",
    meaning: "Fiji's flag emphasizes its Pacific setting and colonial-era heraldry.",
    memoryHook: "The pale blue field is the Pacific Ocean around Fiji.",
    geoContext: {
      location: "Pacific island country in Melanesia, northeast of New Zealand.",
      neighbors: ["Tonga", "Vanuatu", "Samoa"],
      history: [
        "Fiji's scattered islands make ocean context more important than land borders.",
        "British colonial history remains visible in the Union Flag canton.",
        "The shield's agricultural symbols reflect island resources and colonial heraldry.",
      ],
    },
  },
  {
    code: "PG",
    name: "Papua New Guinea",
    region: "Oceania",
    subregion: "Melanesia",
    flagUrl: flagUrl("PG"),
    colors: [
      { name: "Red", hex: "#ce1126", meaning: "traditional color and upper triangle" },
      { name: "Black", hex: "#000000", meaning: "traditional color and lower triangle" },
      { name: "Yellow", hex: "#fcd116", meaning: "bird of paradise" },
      { name: "White", hex: "#ffffff", meaning: "Southern Cross stars" },
    ],
    symbols: [
      { name: "Bird of paradise", meaning: "national identity and local fauna" },
      { name: "Southern Cross", meaning: "southern hemisphere location" },
    ],
    pattern: "Diagonal red and black halves with bird of paradise and Southern Cross.",
    meaning: "The flag joins local identity with southern sky geography.",
    memoryHook: "A bird of paradise flying over a diagonal island flag points to New Guinea.",
    geoContext: {
      location: "Eastern half of New Guinea and nearby islands, north of Australia.",
      neighbors: ["Indonesia", "Australia", "Solomon Islands"],
      history: [
        "Papua New Guinea shares the island of New Guinea with Indonesia.",
        "The land border divides one large island into different political histories.",
        "The bird of paradise makes local natural identity the flag's strongest cue.",
      ],
    },
  },
];

const curatedByCode = new Map(curatedCountries.map((country) => [country.code, country]));

export const countries: Country[] = worldCountryList
  .map((source) => {
    const globalCountry = createGlobalCountry(source);
    const curatedCountry = curatedByCode.get(source.cca2);

    if (!curatedCountry) {
      return globalCountry;
    }

    return {
      ...globalCountry,
      ...curatedCountry,
      region: globalCountry.region,
      subregion: globalCountry.subregion,
      flagUrl: globalCountry.flagUrl,
      wikipediaUrl: globalCountry.wikipediaUrl,
      flagEmoji: globalCountry.flagEmoji,
      capital: globalCountry.capital,
      latlng: globalCountry.latlng,
      independent: globalCountry.independent,
      unMember: globalCountry.unMember,
      isCurated: true,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const regions = Array.from(new Set(countries.map((country) => country.region))).sort();
export const subregions = Array.from(new Set(countries.map((country) => country.subregion))).sort();
