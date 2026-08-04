export type TriviaLanguage = "en" | "es";

export type LocalizedTriviaText = Record<TriviaLanguage, string>;

export type UtahTriviaQuestion = {
  id: string;
  category: LocalizedTriviaText;
  prompt: LocalizedTriviaText;
  options: [LocalizedTriviaText, LocalizedTriviaText, LocalizedTriviaText, LocalizedTriviaText];
  correctIndex: number;
  explanation: LocalizedTriviaText;
  sourceUrl: string;
};

const localized = (en: string, es: string): LocalizedTriviaText => ({ en, es });

const UTAH_STATE_SYMBOLS = "https://www.utah.gov/about/state-symbols.html";
const UTAH_QUICK_FACTS = "https://www.utah.gov/about/quick-facts.html";

export const UTAH_TRIVIA_QUESTIONS: UtahTriviaQuestion[] = [
  {
    id: "capital",
    category: localized("Utah basics", "Datos de Utah"),
    prompt: localized("What is Utah's capital?", "¿Cuál es la capital de Utah?"),
    options: [
      localized("Provo", "Provo"),
      localized("Salt Lake City", "Salt Lake City"),
      localized("Ogden", "Ogden"),
      localized("St. George", "St. George"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Salt Lake City is Utah's capital and largest city.",
      "Salt Lake City es la capital y la ciudad más grande de Utah.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "nickname",
    category: localized("Utah basics", "Datos de Utah"),
    prompt: localized("What is Utah's official nickname?", "¿Cuál es el apodo oficial de Utah?"),
    options: [
      localized("The Golden State", "The Golden State"),
      localized("The Silver State", "The Silver State"),
      localized("The Beehive State", "The Beehive State"),
      localized("The Centennial State", "The Centennial State"),
    ],
    correctIndex: 2,
    explanation: localized(
      "Utah is the Beehive State, a symbol of industry and cooperation.",
      "Utah es el Beehive State, símbolo de trabajo y cooperación.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "statehood-year",
    category: localized("History", "Historia"),
    prompt: localized(
      "In what year did Utah become a state?",
      "¿En qué año se convirtió Utah en estado?",
    ),
    options: [
      localized("1847", "1847"),
      localized("1869", "1869"),
      localized("1896", "1896"),
      localized("1912", "1912"),
    ],
    correctIndex: 2,
    explanation: localized(
      "Utah joined the Union on January 4, 1896.",
      "Utah se incorporó a la Unión el 4 de enero de 1896.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "state-number",
    category: localized("History", "Historia"),
    prompt: localized(
      "Utah was which state to join the Union?",
      "¿Qué número de estado fue Utah al ingresar a la Unión?",
    ),
    options: [
      localized("40th", "40.º"),
      localized("45th", "45.º"),
      localized("48th", "48.º"),
      localized("50th", "50.º"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Utah became the 45th U.S. state.",
      "Utah se convirtió en el 45.º estado de EE. UU.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "highest-point",
    category: localized("Landmarks", "Lugares"),
    prompt: localized("What is the highest point in Utah?", "¿Cuál es el punto más alto de Utah?"),
    options: [
      localized("Mount Timpanogos", "Mount Timpanogos"),
      localized("Kings Peak", "Kings Peak"),
      localized("Delicate Arch", "Delicate Arch"),
      localized("Brian Head", "Brian Head"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Kings Peak rises to 13,528 feet in the Uinta Mountains.",
      "Kings Peak alcanza 13,528 pies en las montañas Uinta.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "state-bird",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state bird?", "¿Cuál es el ave estatal de Utah?"),
    options: [
      localized("Bald eagle", "Águila calva"),
      localized("California gull", "Gaviota de California"),
      localized("Roadrunner", "Correcaminos"),
      localized("Mountain bluebird", "Azulejo de montaña"),
    ],
    correctIndex: 1,
    explanation: localized(
      "The California gull is Utah's state bird.",
      "La gaviota de California es el ave estatal de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-flower",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("Which flower represents Utah?", "¿Qué flor representa a Utah?"),
    options: [
      localized("Sego lily", "Lirio sego"),
      localized("Sunflower", "Girasol"),
      localized("Columbine", "Aguileña"),
      localized("Desert marigold", "Caléndula del desierto"),
    ],
    correctIndex: 0,
    explanation: localized(
      "The sego lily has been Utah's state flower since 1911.",
      "El lirio sego es la flor estatal de Utah desde 1911.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-tree",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state tree?", "¿Cuál es el árbol estatal de Utah?"),
    options: [
      localized("Blue spruce", "Pícea azul"),
      localized("Ponderosa pine", "Pino ponderosa"),
      localized("Quaking aspen", "Álamo temblón"),
      localized("Cottonwood", "Álamo de Virginia"),
    ],
    correctIndex: 2,
    explanation: localized(
      "Utah designated the quaking aspen as its state tree in 2014.",
      "Utah designó al álamo temblón como árbol estatal en 2014.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-motto",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state motto?", "¿Cuál es el lema estatal de Utah?"),
    options: [
      localized("Industry", "Industria"),
      localized("Forward", "Adelante"),
      localized("Liberty", "Libertad"),
      localized("Hope", "Esperanza"),
    ],
    correctIndex: 0,
    explanation: localized(
      "Utah's state motto is “Industry.”",
      "El lema estatal de Utah es «Industria».",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-fossil",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized(
      "Which dinosaur is Utah's state fossil?",
      "¿Qué dinosaurio es el fósil estatal de Utah?",
    ),
    options: [
      localized("Tyrannosaurus", "Tiranosaurio"),
      localized("Triceratops", "Triceratops"),
      localized("Allosaurus", "Allosaurus"),
      localized("Stegosaurus", "Stegosaurus"),
    ],
    correctIndex: 2,
    explanation: localized(
      "Allosaurus is Utah's official state fossil.",
      "El Allosaurus es el fósil oficial del estado de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-gem",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state gem?", "¿Cuál es la gema estatal de Utah?"),
    options: [
      localized("Turquoise", "Turquesa"),
      localized("Topaz", "Topacio"),
      localized("Opal", "Ópalo"),
      localized("Garnet", "Granate"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Topaz, found in Utah's Thomas Range, is the state gem.",
      "El topacio, hallado en Thomas Range, es la gema estatal.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-insect",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized(
      "Which insect represents the Beehive State?",
      "¿Qué insecto representa al Beehive State?",
    ),
    options: [
      localized("Monarch butterfly", "Mariposa monarca"),
      localized("Honey bee", "Abeja melífera"),
      localized("Dragonfly", "Libélula"),
      localized("Ladybug", "Mariquita"),
    ],
    correctIndex: 1,
    explanation: localized(
      "The honey bee is Utah's state insect.",
      "La abeja melífera es el insecto estatal de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-fruit",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state fruit?", "¿Cuál es la fruta estatal de Utah?"),
    options: [
      localized("Apple", "Manzana"),
      localized("Peach", "Durazno"),
      localized("Cherry", "Cereza"),
      localized("Pear", "Pera"),
    ],
    correctIndex: 2,
    explanation: localized(
      "The cherry is Utah's official state fruit.",
      "La cereza es la fruta oficial del estado de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-cooking-pot",
    category: localized("Utah culture", "Cultura de Utah"),
    prompt: localized(
      "What is Utah's official state cooking pot?",
      "¿Cuál es la olla oficial del estado de Utah?",
    ),
    options: [
      localized("Wok", "Wok"),
      localized("Dutch oven", "Olla holandesa"),
      localized("Pressure cooker", "Olla a presión"),
      localized("Copper kettle", "Caldero de cobre"),
    ],
    correctIndex: 1,
    explanation: localized(
      "The Dutch oven reflects Utah's pioneer cooking tradition.",
      "La olla holandesa refleja la tradición culinaria pionera de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "winter-sports",
    category: localized("Utah culture", "Cultura de Utah"),
    prompt: localized(
      "What are Utah's official state winter sports?",
      "¿Cuáles son los deportes de invierno oficiales de Utah?",
    ),
    options: [
      localized("Hockey and curling", "Hockey y curling"),
      localized("Skiing and snowboarding", "Esquí y snowboard"),
      localized("Skating and sledding", "Patinaje y trineo"),
      localized("Biathlon and luge", "Biatlón y luge"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Skiing and snowboarding are Utah's official winter sports.",
      "El esquí y el snowboard son los deportes de invierno oficiales de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "delicate-arch",
    category: localized("National parks", "Parques nacionales"),
    prompt: localized(
      "In which park will you find Delicate Arch?",
      "¿En qué parque se encuentra Delicate Arch?",
    ),
    options: [
      localized("Zion", "Zion"),
      localized("Capitol Reef", "Capitol Reef"),
      localized("Arches", "Arches"),
      localized("Canyonlands", "Canyonlands"),
    ],
    correctIndex: 2,
    explanation: localized(
      "Delicate Arch is one of the best-known landmarks in Arches National Park.",
      "Delicate Arch es uno de los lugares más conocidos de Arches National Park.",
    ),
    sourceUrl: "https://www.nps.gov/arch/planyourvisit/delicate-arch.htm",
  },
  {
    id: "hoodoos",
    category: localized("National parks", "Parques nacionales"),
    prompt: localized(
      "What are Bryce Canyon's famous rock spires called?",
      "¿Cómo se llaman las famosas agujas rocosas de Bryce Canyon?",
    ),
    options: [
      localized("Hoodoos", "Hoodoos"),
      localized("Buttes", "Buttes"),
      localized("Mesas", "Mesas"),
      localized("Monoliths", "Monolitos"),
    ],
    correctIndex: 0,
    explanation: localized(
      "Bryce Canyon is famous for its dense landscape of hoodoos.",
      "Bryce Canyon es famoso por su denso paisaje de hoodoos.",
    ),
    sourceUrl: "https://www.nps.gov/brca/learn/nature/hoodoos.htm",
  },
  {
    id: "weber-city",
    category: localized("Local knowledge", "Conocimiento local"),
    prompt: localized(
      "In which Utah city is Weber State University based?",
      "¿En qué ciudad de Utah se encuentra Weber State University?",
    ),
    options: [
      localized("Logan", "Logan"),
      localized("Ogden", "Ogden"),
      localized("Provo", "Provo"),
      localized("Cedar City", "Cedar City"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Weber State University's main campus is in Ogden.",
      "El campus principal de Weber State University está en Ogden.",
    ),
    sourceUrl: "https://www.weber.edu/aboutwsu/",
  },
  {
    id: "weber-founded",
    category: localized("Local knowledge", "Conocimiento local"),
    prompt: localized(
      "When was Weber State University founded?",
      "¿Cuándo se fundó Weber State University?",
    ),
    options: [
      localized("1850", "1850"),
      localized("1889", "1889"),
      localized("1911", "1911"),
      localized("1948", "1948"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Weber State was founded in 1889 as Weber Stake Academy.",
      "Weber State se fundó en 1889 como Weber Stake Academy.",
    ),
    sourceUrl: "https://www.weber.edu/AboutWSU/history.html",
  },
  {
    id: "golden-spike",
    category: localized("History", "Historia"),
    prompt: localized(
      "Where in Utah was the first transcontinental railroad completed?",
      "¿Dónde se completó el primer ferrocarril transcontinental en Utah?",
    ),
    options: [
      localized("Promontory Summit", "Promontory Summit"),
      localized("Monument Valley", "Monument Valley"),
      localized("Bonneville Salt Flats", "Bonneville Salt Flats"),
      localized("Emigration Canyon", "Emigration Canyon"),
    ],
    correctIndex: 0,
    explanation: localized(
      "The rails met at Promontory Summit on May 10, 1869.",
      "Los rieles se unieron en Promontory Summit el 10 de mayo de 1869.",
    ),
    sourceUrl: "https://www.nps.gov/gosp/index.htm",
  },
];

export function createTriviaRound(
  questions: readonly UtahTriviaQuestion[] = UTAH_TRIVIA_QUESTIONS,
  count = 10,
  random: () => number = Math.random,
): UtahTriviaQuestion[] {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.max(0, Math.min(count, shuffled.length)));
}
