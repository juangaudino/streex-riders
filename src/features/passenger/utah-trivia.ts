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
  {
    id: "state-animal",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state animal?", "¿Cuál es el animal estatal de Utah?"),
    options: [
      localized("Bison", "Bisonte"),
      localized("Rocky Mountain elk", "Alce de las Montañas Rocosas"),
      localized("Pronghorn", "Berrendo"),
      localized("Mule deer", "Ciervo bura"),
    ],
    correctIndex: 1,
    explanation: localized(
      "The Rocky Mountain elk is Utah's official state animal.",
      "El alce de las Montañas Rocosas es el animal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-bird-of-prey",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized(
      "Which bird of prey is an official Utah state symbol?",
      "¿Qué ave de presa es un símbolo estatal oficial de Utah?",
    ),
    options: [
      localized("Peregrine falcon", "Halcón peregrino"),
      localized("Golden eagle", "Águila real"),
      localized("Red-tailed hawk", "Halcón de cola roja"),
      localized("Great horned owl", "Búho cornudo"),
    ],
    correctIndex: 1,
    explanation: localized(
      "The golden eagle is Utah's official state bird of prey.",
      "El águila real es el ave de presa estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-crustacean",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized(
      "What is Utah's official state crustacean?",
      "¿Cuál es el crustáceo estatal oficial de Utah?",
    ),
    options: [
      localized("Dungeness crab", "Cangrejo Dungeness"),
      localized("Brine shrimp", "Artemia salina"),
      localized("Lobster", "Langosta"),
      localized("Crayfish", "Cangrejo de río"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Artemia franciscana, better known as brine shrimp, is Utah's state crustacean.",
      "Artemia franciscana, conocida como artemia salina, es el crustáceo estatal de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "utah-demonym",
    category: localized("Utah basics", "Datos de Utah"),
    prompt: localized(
      "What is the official demonym for a person from Utah?",
      "¿Cuál es el gentilicio oficial de una persona de Utah?",
    ),
    options: [
      localized("Utahian", "Utahian"),
      localized("Utahn", "Utahn"),
      localized("Utahite", "Utahite"),
      localized("Ute", "Ute"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Utahn is Utah's official state demonym.",
      "Utahn es el gentilicio estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-dinosaur",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized(
      "What is Utah's official state dinosaur?",
      "¿Cuál es el dinosaurio estatal oficial de Utah?",
    ),
    options: [
      localized("Allosaurus", "Allosaurus"),
      localized("Utahraptor", "Utahraptor"),
      localized("Triceratops", "Triceratops"),
      localized("Diplodocus", "Diplodocus"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Utahraptor is Utah's official state dinosaur; Allosaurus is its state fossil.",
      "Utahraptor es el dinosaurio estatal oficial; Allosaurus es el fósil estatal.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-fish",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state fish?", "¿Cuál es el pez estatal de Utah?"),
    options: [
      localized("Rainbow trout", "Trucha arcoíris"),
      localized("Bonneville cutthroat trout", "Trucha degollada de Bonneville"),
      localized("Brown trout", "Trucha marrón"),
      localized("Lake trout", "Trucha de lago"),
    ],
    correctIndex: 1,
    explanation: localized(
      "The Bonneville cutthroat trout is Utah's official state fish.",
      "La trucha degollada de Bonneville es el pez estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-folk-dance",
    category: localized("Utah culture", "Cultura de Utah"),
    prompt: localized(
      "What is Utah's official state folk dance?",
      "¿Cuál es el baile folclórico estatal de Utah?",
    ),
    options: [
      localized("Line dance", "Baile en línea"),
      localized("Square dance", "Baile cuadrado"),
      localized("Waltz", "Vals"),
      localized("Two-step", "Two-step"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Square dance is Utah's official state folk dance.",
      "El square dance es el baile folclórico estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-grass",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state grass?", "¿Cuál es la hierba estatal de Utah?"),
    options: [
      localized("Buffalo grass", "Pasto búfalo"),
      localized("Indian ricegrass", "Pasto arroz de la India"),
      localized("Blue grama", "Grama azul"),
      localized("Sagebrush", "Artemisa"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Indian ricegrass is Utah's official state grass.",
      "El pasto arroz de la India es la hierba estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-mineral",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state mineral?", "¿Cuál es el mineral estatal de Utah?"),
    options: [
      localized("Copper", "Cobre"),
      localized("Silver", "Plata"),
      localized("Gold", "Oro"),
      localized("Quartz", "Cuarzo"),
    ],
    correctIndex: 0,
    explanation: localized(
      "Copper is Utah's official state mineral.",
      "El cobre es el mineral estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-mushroom",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state mushroom?", "¿Cuál es el hongo estatal de Utah?"),
    options: [
      localized("Morel", "Colmenilla"),
      localized("Porcini", "Porcini"),
      localized("Chanterelle", "Rebozuelo"),
      localized("Oyster mushroom", "Seta ostra"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Porcini is Utah's official state mushroom.",
      "El porcini es el hongo estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-railroad-museum",
    category: localized("Local knowledge", "Conocimiento local"),
    prompt: localized(
      "Which place is Utah's official state railroad museum?",
      "¿Qué lugar es el museo ferroviario estatal oficial de Utah?",
    ),
    options: [
      localized("Ogden Union Station", "Ogden Union Station"),
      localized("Salt Lake Central", "Salt Lake Central"),
      localized("Heber Depot", "Heber Depot"),
      localized("Provo Station", "Provo Station"),
    ],
    correctIndex: 0,
    explanation: localized(
      "Ogden Union Station is Utah's official state railroad museum.",
      "Ogden Union Station es el museo ferroviario estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-rock",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state rock?", "¿Cuál es la roca estatal de Utah?"),
    options: [
      localized("Sandstone", "Arenisca"),
      localized("Coal", "Carbón"),
      localized("Granite", "Granito"),
      localized("Limestone", "Caliza"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Coal is Utah's official state rock.",
      "El carbón es la roca estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-song",
    category: localized("Utah culture", "Cultura de Utah"),
    prompt: localized("What is Utah's state song?", "¿Cuál es la canción estatal de Utah?"),
    options: [
      localized("Utah, This Is the Place", "Utah, This Is the Place"),
      localized("Rocky Mountain High", "Rocky Mountain High"),
      localized("Home Means Nevada", "Home Means Nevada"),
      localized("Big Rock Candy Mountain", "Big Rock Candy Mountain"),
    ],
    correctIndex: 0,
    explanation: localized(
      "Utah, This Is the Place is the official state song.",
      "Utah, This Is the Place es la canción estatal oficial.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "historic-vegetable",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized(
      "What is Utah's official historic state vegetable?",
      "¿Cuál es la verdura histórica estatal oficial de Utah?",
    ),
    options: [
      localized("Sugar beet", "Remolacha azucarera"),
      localized("Potato", "Papa"),
      localized("Corn", "Maíz"),
      localized("Pumpkin", "Calabaza"),
    ],
    correctIndex: 0,
    explanation: localized(
      "The sugar beet is Utah's official historic state vegetable.",
      "La remolacha azucarera es la verdura histórica estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-vegetable",
    category: localized("State symbols", "Símbolos estatales"),
    prompt: localized("What is Utah's state vegetable?", "¿Cuál es la verdura estatal de Utah?"),
    options: [
      localized("Spanish sweet onion", "Cebolla dulce española"),
      localized("Sweet corn", "Maíz dulce"),
      localized("Carrot", "Zanahoria"),
      localized("Tomato", "Tomate"),
    ],
    correctIndex: 0,
    explanation: localized(
      "The Spanish sweet onion is Utah's official state vegetable.",
      "La cebolla dulce española es la verdura estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "state-firearm",
    category: localized("Utah history", "Historia de Utah"),
    prompt: localized(
      "Which firearm is an official Utah state symbol?",
      "¿Qué arma de fuego es un símbolo estatal oficial de Utah?",
    ),
    options: [
      localized("M1911 automatic pistol", "Pistola automática M1911"),
      localized("Winchester Model 1873", "Winchester Modelo 1873"),
      localized("Colt Single Action Army", "Colt Single Action Army"),
      localized("M1 Garand", "M1 Garand"),
    ],
    correctIndex: 0,
    explanation: localized(
      "The John M. Browning designed M1911 automatic pistol is an official Utah state symbol.",
      "La pistola automática M1911 diseñada por John M. Browning es un símbolo estatal oficial de Utah.",
    ),
    sourceUrl: UTAH_STATE_SYMBOLS,
  },
  {
    id: "name-origin",
    category: localized("Utah basics", "Datos de Utah"),
    prompt: localized(
      "One Utah.gov explanation traces the name Utah to which people?",
      "Una explicación de Utah.gov relaciona el nombre Utah con qué pueblo?",
    ),
    options: [
      localized("Ute", "Ute"),
      localized("Navajo", "Navajo"),
      localized("Paiute", "Paiute"),
      localized("Shoshone", "Shoshone"),
    ],
    correctIndex: 0,
    explanation: localized(
      "Utah.gov notes one origin theory ties the name to the Ute people, meaning people of the mountains.",
      "Utah.gov indica que una teoría relaciona el nombre con el pueblo Ute, «gente de las montañas».",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "utah-area-rank",
    category: localized("Utah basics", "Datos de Utah"),
    prompt: localized(
      "By area, where does Utah rank among U.S. states?",
      "Por superficie, ¿qué lugar ocupa Utah entre los estados de EE. UU.?",
    ),
    options: [
      localized("8th", "8.º"),
      localized("11th", "11.º"),
      localized("17th", "17.º"),
      localized("24th", "24.º"),
    ],
    correctIndex: 1,
    explanation: localized(
      "Utah covers about 84,900 square miles, making it the 11th largest state by area.",
      "Utah abarca alrededor de 84,900 millas cuadradas y es el 11.º estado por superficie.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "lowest-point",
    category: localized("Landmarks", "Lugares"),
    prompt: localized("What is Utah's lowest point?", "¿Cuál es el punto más bajo de Utah?"),
    options: [
      localized("Beaver Dam Wash", "Beaver Dam Wash"),
      localized("Great Salt Lake", "Great Salt Lake"),
      localized("Green River", "Green River"),
      localized("Moab Valley", "Valle de Moab"),
    ],
    correctIndex: 0,
    explanation: localized(
      "Beaver Dam Wash is Utah's lowest point at about 2,350 feet.",
      "Beaver Dam Wash es el punto más bajo de Utah, a unos 2,350 pies.",
    ),
    sourceUrl: UTAH_QUICK_FACTS,
  },
  {
    id: "national-parks-count",
    category: localized("National parks", "Parques nacionales"),
    prompt: localized(
      "How many national parks are in Utah?",
      "¿Cuántos parques nacionales hay en Utah?",
    ),
    options: [localized("3", "3"), localized("5", "5"), localized("7", "7"), localized("9", "9")],
    correctIndex: 1,
    explanation: localized(
      "Utah is home to five national parks: Arches, Bryce Canyon, Canyonlands, Capitol Reef and Zion.",
      "Utah tiene cinco parques nacionales: Arches, Bryce Canyon, Canyonlands, Capitol Reef y Zion.",
    ),
    sourceUrl: "https://www.nps.gov/state/ut/index.htm",
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
