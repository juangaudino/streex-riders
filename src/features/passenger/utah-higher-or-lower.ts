import type { LocalizedTriviaText, TriviaLanguage } from "./utah-trivia";

export type UtahHigherOrLowerQuestion = {
  id: string;
  category: LocalizedTriviaText;
  prompt: LocalizedTriviaText;
  left: LocalizedTriviaText;
  right: LocalizedTriviaText;
  correctSide: "left" | "right";
  explanation: LocalizedTriviaText;
  sourceUrl: string;
};

const localized = (en: string, es: string): LocalizedTriviaText => ({ en, es });

const UTAH_QUICK_FACTS = "https://www.utah.gov/about/quick-facts.html";
const UTAH_STATE_SYMBOLS = "https://www.utah.gov/about/state-symbols.html";
const NPS_ARCHES = "https://www.nps.gov/arch/learn/nature/index.htm";
const NPS_CANYONLANDS = "https://www.nps.gov/cany/learn/nature/index.htm";
const NPS_BRYCE = "https://www.nps.gov/brca/planyourvisit/index.htm";
const NPS_ZION = "https://www.nps.gov/zion/planyourvisit/index.htm";
const UTAH_RESORTS = "https://www.visitutah.com/things-to-do/skiing-snowboarding";

export const UTAH_HIGHER_OR_LOWER_QUESTIONS: UtahHigherOrLowerQuestion[] = [
  {
    id: "highest-peak",
    category: localized("Peaks", "Cumbres"),
    prompt: localized("Which is higher in elevation?", "¿Cuál está a mayor altitud?"),
    left: localized("Kings Peak", "Kings Peak"),
    right: localized("Mount Timpanogos", "Mount Timpanogos"),
    correctSide: "left",
    explanation: localized(
      "Kings Peak is Utah's highest point at 13,528 feet.",
      "Kings Peak es el punto más alto de Utah, con 13,528 pies.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "park-city-slc-elevation",
    category: localized("Mountain towns", "Pueblos de montaña"),
    prompt: localized(
      "Which city sits higher above sea level?",
      "¿Qué ciudad está más alta sobre el nivel del mar?",
    ),
    left: localized("Salt Lake City", "Salt Lake City"),
    right: localized("Park City", "Park City"),
    correctSide: "right",
    explanation: localized(
      "Park City is about 7,000 feet above sea level; Salt Lake City is about 4,265 feet.",
      "Park City está a unos 7,000 pies; Salt Lake City, a unos 4,265 pies.",
    ),
    sourceUrl: UTAH_RESORTS,
  },
  {
    id: "alta-snowbird-base",
    category: localized("Ski country", "Territorio de esquí"),
    prompt: localized(
      "Which resort has the higher base elevation?",
      "¿Qué resort tiene una base más alta?",
    ),
    left: localized("Snowbird", "Snowbird"),
    right: localized("Alta", "Alta"),
    correctSide: "right",
    explanation: localized(
      "Alta's base is about 8,530 feet, slightly above Snowbird's 8,100-foot base.",
      "La base de Alta está a unos 8,530 pies, por encima de los 8,100 pies de Snowbird.",
    ),
    sourceUrl: UTAH_RESORTS,
  },
  {
    id: "bryce-zion-elevation",
    category: localized("National parks", "Parques nacionales"),
    prompt: localized(
      "Which park's main visitor area is higher in elevation?",
      "¿Qué parque tiene su área principal de visitantes a mayor altitud?",
    ),
    left: localized("Zion National Park", "Parque Nacional Zion"),
    right: localized("Bryce Canyon National Park", "Parque Nacional Bryce Canyon"),
    correctSide: "right",
    explanation: localized(
      "Bryce Canyon's rim sits far higher than Zion Canyon's main visitor area.",
      "El borde de Bryce Canyon está mucho más alto que el área principal de Zion Canyon.",
    ),
    sourceUrl: NPS_BRYCE,
  },
  {
    id: "canyonlands-arches-area",
    category: localized("National parks", "Parques nacionales"),
    prompt: localized(
      "Which national park covers more land?",
      "¿Qué parque nacional cubre más terreno?",
    ),
    left: localized("Arches", "Arches"),
    right: localized("Canyonlands", "Canyonlands"),
    correctSide: "right",
    explanation: localized(
      "Canyonlands is much larger than Arches National Park.",
      "Canyonlands es mucho más grande que el Parque Nacional Arches.",
    ),
    sourceUrl: NPS_CANYONLANDS,
  },
  {
    id: "arches-count",
    category: localized("Red rock", "Roca roja"),
    prompt: localized(
      "Which park is known for more than 2,000 natural stone arches?",
      "¿Qué parque es conocido por más de 2,000 arcos naturales de piedra?",
    ),
    left: localized("Zion", "Zion"),
    right: localized("Arches", "Arches"),
    correctSide: "right",
    explanation: localized(
      "Arches National Park protects more than 2,000 documented natural stone arches.",
      "Arches protege más de 2,000 arcos naturales de piedra documentados.",
    ),
    sourceUrl: NPS_ARCHES,
  },
  {
    id: "great-salt-lake-bear-lake",
    category: localized("Utah waters", "Aguas de Utah"),
    prompt: localized("Which lake is larger in surface area?", "¿Qué lago tiene mayor superficie?"),
    left: localized("Bear Lake", "Bear Lake"),
    right: localized("Great Salt Lake", "Great Salt Lake"),
    correctSide: "right",
    explanation: localized(
      "Great Salt Lake is Utah's largest lake and the largest saltwater lake in the Western Hemisphere.",
      "Great Salt Lake es el lago más grande de Utah y el lago de agua salada más grande del hemisferio occidental.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "ogden-provo-north",
    category: localized("Wasatch Front", "Wasatch Front"),
    prompt: localized("Which city is farther north?", "¿Qué ciudad está más al norte?"),
    left: localized("Provo", "Provo"),
    right: localized("Ogden", "Ogden"),
    correctSide: "right",
    explanation: localized(
      "Ogden sits north of Salt Lake City, while Provo is to the south.",
      "Ogden está al norte de Salt Lake City, mientras que Provo está al sur.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "moab-st-george-south",
    category: localized("Southern Utah", "Sur de Utah"),
    prompt: localized("Which city is farther south?", "¿Qué ciudad está más al sur?"),
    left: localized("Moab", "Moab"),
    right: localized("St. George", "St. George"),
    correctSide: "right",
    explanation: localized(
      "St. George is near Utah's southwest corner, farther south than Moab.",
      "St. George está cerca de la esquina suroeste de Utah, más al sur que Moab.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "sego-lily-aspen-year",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized(
      "Which became an official Utah state symbol more recently?",
      "¿Cuál se convirtió en símbolo oficial de Utah más recientemente?",
    ),
    left: localized("Sego lily", "Lirio sego"),
    right: localized("Quaking aspen", "Álamo temblón"),
    correctSide: "right",
    explanation: localized(
      "The sego lily became the state flower in 1911; the quaking aspen became the state tree in 2014.",
      "El lirio sego fue flor estatal en 1911; el álamo temblón se convirtió en árbol estatal en 2014.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "statehood-railroad-year",
    category: localized("Utah history", "Historia de Utah"),
    prompt: localized(
      "Which happened later in Utah history?",
      "¿Qué ocurrió después en la historia de Utah?",
    ),
    left: localized(
      "The transcontinental railroad reached Utah",
      "El ferrocarril transcontinental llegó a Utah",
    ),
    right: localized("Utah became a state", "Utah se convirtió en estado"),
    correctSide: "right",
    explanation: localized(
      "The railroad connection was completed in 1869; Utah became a state in 1896.",
      "La conexión ferroviaria se completó en 1869; Utah se convirtió en estado en 1896.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "utah-state-number",
    category: localized("Utah history", "Historia de Utah"),
    prompt: localized("Which number is larger?", "¿Qué número es mayor?"),
    left: localized("Utah as the 45th state", "Utah como el estado número 45"),
    right: localized("The 40th state", "El estado número 40"),
    correctSide: "left",
    explanation: localized(
      "Utah joined the Union as the 45th state in 1896.",
      "Utah ingresó a la Unión como el estado número 45 en 1896.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "state-flower-fossil-year",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("Which was designated earlier?", "¿Cuál fue designado antes?"),
    left: localized("Sego lily as state flower", "El lirio sego como flor estatal"),
    right: localized("Allosaurus as state fossil", "Allosaurus como fósil estatal"),
    correctSide: "left",
    explanation: localized(
      "The sego lily was designated in 1911, decades before Allosaurus became the state fossil.",
      "El lirio sego fue designado en 1911, décadas antes de que Allosaurus fuera el fósil estatal.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "salt-lake-city-ogden-population",
    category: localized("Utah cities", "Ciudades de Utah"),
    prompt: localized("Which is Utah's larger city?", "¿Cuál es la ciudad más grande de Utah?"),
    left: localized("Ogden", "Ogden"),
    right: localized("Salt Lake City", "Salt Lake City"),
    correctSide: "right",
    explanation: localized(
      "Salt Lake City is Utah's capital and largest city.",
      "Salt Lake City es la capital y la ciudad más grande de Utah.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "state-bird-insect-size",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized(
      "Which state symbol is generally larger?",
      "¿Qué símbolo estatal suele ser más grande?",
    ),
    left: localized("Honey bee", "Abeja melífera"),
    right: localized("California gull", "Gaviota de California"),
    correctSide: "right",
    explanation: localized(
      "Utah's California gull is much larger than its state insect, the honey bee.",
      "La gaviota de California es mucho más grande que la abeja melífera, el insecto estatal.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-gem-size",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("Which is Utah's state gem?", "¿Cuál es la gema estatal de Utah?"),
    left: localized("Topaz", "Topacio"),
    right: localized("Turquoise", "Turquesa"),
    correctSide: "left",
    explanation: localized(
      "Topaz is Utah's state gem and is found in the Thomas Range.",
      "El topacio es la gema estatal de Utah y se encuentra en Thomas Range.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-motto",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized(
      "Which word is Utah's official state motto?",
      "¿Qué palabra es el lema oficial de Utah?",
    ),
    left: localized("Industry", "Industria"),
    right: localized("Liberty", "Libertad"),
    correctSide: "left",
    explanation: localized(
      "Utah's state motto is Industry.",
      "El lema estatal de Utah es Industria.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "utah-federal-lands",
    category: localized("Utah basics", "Datos de Utah"),
    prompt: localized("Which is larger in Utah?", "¿Qué es mayor en Utah?"),
    left: localized("Federal land share", "Proporción de tierras federales"),
    right: localized("The remaining land share", "La proporción de terreno restante"),
    correctSide: "right",
    explanation: localized(
      "About 42% of Utah is federally managed, so the remaining share is larger.",
      "Aproximadamente el 42% de Utah es terreno federal, por lo que el resto es mayor.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "zion-bryce-south",
    category: localized("National parks", "Parques nacionales"),
    prompt: localized(
      "Which national park is farther south?",
      "¿Qué parque nacional está más al sur?",
    ),
    left: localized("Bryce Canyon", "Bryce Canyon"),
    right: localized("Zion", "Zion"),
    correctSide: "right",
    explanation: localized(
      "Zion lies south of Bryce Canyon in Utah's canyon country.",
      "Zion se encuentra al sur de Bryce Canyon, en la región de cañones de Utah.",
    ),
    sourceUrl: NPS_ZION,
  },
  {
    id: "park-city-snowbird-distance",
    category: localized("Mountain access", "Acceso a montaña"),
    prompt: localized(
      "Which destination is farther from downtown Salt Lake City?",
      "¿Qué destino está más lejos del centro de Salt Lake City?",
    ),
    left: localized("Snowbird", "Snowbird"),
    right: localized("Park City", "Park City"),
    correctSide: "right",
    explanation: localized(
      "Park City is farther from downtown Salt Lake City than Snowbird.",
      "Park City está más lejos del centro de Salt Lake City que Snowbird.",
    ),
    sourceUrl: UTAH_RESORTS,
  },
];

export function createHigherOrLowerRound(
  questions: readonly UtahHigherOrLowerQuestion[] = UTAH_HIGHER_OR_LOWER_QUESTIONS,
  count = 10,
  random: () => number = Math.random,
): UtahHigherOrLowerQuestion[] {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.max(0, Math.min(count, shuffled.length)));
}

export type HigherOrLowerLanguage = TriviaLanguage;
