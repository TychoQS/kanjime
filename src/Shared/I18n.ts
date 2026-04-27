import type { ApplicationTheme, HistoryCategory } from "./DomainTypes";

export const SUPPORTED_LOCALES = [
  "en-US",
  "en-GB",
  "es-ES",
  "fr-FR",
  "de-DE",
  "it-IT",
  "pt-PT",
  "ja-JP",
  "zh-CN",
  "zh-TW",
  "ko-KR",
  "hi-IN",
  "ar-SA",
  "sw-KE",
  "am-ET",
  "ha-NG",
  "yo-NG",
  "zu-ZA"
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type TranslationKey =
  | "appName"
  | "about"
  | "acknowledgments"
  | "activeLanguage"
  | "activeTheme"
  | "cameraOrLibrary"
  | "changeLanguage"
  | "changeTheme"
  | "clear"
  | "clearDrawing"
  | "clearImage"
  | "components"
  | "copyKanji"
  | "dataSources"
  | "drawing"
  | "drawingClassification"
  | "emptyHistory"
  | "emptyResults"
  | "examples"
  | "history"
  | "image"
  | "imageClassification"
  | "information"
  | "kanjiDetails"
  | "kunyomi"
  | "language"
  | "license"
  | "loadingApplication"
  | "loadingModel"
  | "meaning"
  | "navigation"
  | "noImage"
  | "noKanjiSelected"
  | "noResults"
  | "onyomi"
  | "openMenu"
  | "primaryAction"
  | "radical"
  | "readings"
  | "recognition"
  | "results"
  | "search"
  | "searchHistory"
  | "searchPlaceholder"
  | "selectCrop"
  | "settings"
  | "strokeCount"
  | "strokeOrder"
  | "terms"
  | "version"
  | "visitedEntries"
  | "authorship"
  | "authorshipName"
  | "model"
  | "modelDetail"
  | "modelDetailEmpty"
  | "textConversion"
  | "textConversionValue"
  | "interface"
  | "interfaceValue"
  | "licenseDetail"
  | "termsDetail";

type TranslationMap = Record<TranslationKey, string>;

const ENGLISH_TRANSLATIONS: TranslationMap = {
  appName: "Kanji Recognizer",
  about: "About",
  acknowledgments: "Acknowledgments",
  activeLanguage: "Language",
  activeTheme: "Theme",
  cameraOrLibrary: "Choose image",
  changeLanguage: "Change language",
  changeTheme: "Change theme",
  clear: "Clear",
  clearDrawing: "Clear drawing",
  clearImage: "Clear image",
  components: "Components",
  copyKanji: "Copy kanji",
  dataSources: "Data sources",
  drawing: "Drawing",
  drawingClassification: "Drawing",
  emptyHistory: "No history entries yet.",
  emptyResults: "Results will appear here.",
  examples: "Examples",
  history: "History",
  image: "Image",
  imageClassification: "Image",
  information: "Information",
  kanjiDetails: "Kanji details",
  kunyomi: "Kunyomi",
  language: "Language",
  license: "License",
  loadingApplication: "Preparing the offline dictionary.",
  loadingModel: "Loading recognition model.",
  meaning: "Meaning",
  navigation: "Navigation",
  noImage: "Choose an image or draw a character to start.",
  noKanjiSelected: "Select a kanji to see details.",
  noResults: "No matching kanji were found.",
  onyomi: "Onyomi",
  openMenu: "Open menu",
  primaryAction: "Primary action",
  radical: "Radical",
  readings: "Readings",
  recognition: "Recognition",
  results: "Results",
  search: "Search",
  searchHistory: "Searches",
  searchPlaceholder: "Kanji, reading, or meaning",
  selectCrop: "Drag on the image to refine the area.",
  settings: "Settings",
  strokeCount: "Strokes",
  strokeOrder: "Stroke order",
  terms: "Terms of use",
  version: "Version",
  visitedEntries: "Visited",
  authorship: "Authorship",
  authorshipName: "Tycho Quintana Santana",
  model: "Model",
  modelDetail: "{{count}} kanji classes with ONNX Runtime Web",
  modelDetailEmpty: "ONNX Runtime Web",
  textConversion: "Text conversion",
  textConversionValue: "Wanakana",
  interface: "Interface",
  interfaceValue: "Ionic React and Capacitor",
  licenseDetail: "Academic project. Data source licenses apply.",
  termsDetail: "Works offline and stores recognition history on this device."
};

const TRANSLATIONS: Partial<Record<SupportedLocale, Partial<TranslationMap>>> = {
  "es-ES": {
    about: "Acerca de",
    acknowledgments: "Agradecimientos",
    activeLanguage: "Idioma",
    activeTheme: "Tema",
    cameraOrLibrary: "Elegir imagen",
    changeLanguage: "Cambiar idioma",
    changeTheme: "Cambiar tema",
    clear: "Borrar",
    clearDrawing: "Borrar dibujo",
    clearImage: "Borrar imagen",
    components: "Componentes",
    dataSources: "Fuentes de datos",
    drawing: "Dibujo",
    examples: "Ejemplos",
    history: "Historial",
    image: "Imagen",
    information: "Información",
    kunyomi: "Kunyomi",
    language: "Idioma",
    license: "Licencia",
    meaning: "Significado",
    navigation: "Navegación",
    noResults: "No se encontraron kanji.",
    onyomi: "Onyomi",
    radical: "Radical",
    readings: "Lecturas",
    recognition: "Reconocimiento",
    results: "Resultados",
    search: "Buscar",
    searchHistory: "Búsquedas",
    searchPlaceholder: "Kanji, lectura o significado",
    settings: "Ajustes",
    strokeCount: "Trazos",
    strokeOrder: "Orden de trazos",
    version: "Versión",
    visitedEntries: "Visitadas",
    authorship: "Autoría",
    authorshipName: "Tycho Quintana Santana",
    model: "Modelo",
    modelDetail: "{{count}} clases de kanji con ONNX Runtime Web",
    modelDetailEmpty: "ONNX Runtime Web",
    textConversion: "Conversión de texto",
    textConversionValue: "Wanakana",
    interface: "Interfaz",
    interfaceValue: "Ionic React y Capacitor",
    licenseDetail: "Proyecto académico. Se aplican las licencias de las fuentes de datos.",
    termsDetail: "Funciona sin conexión y guarda el historial de reconocimiento en este dispositivo."
  },
  "fr-FR": {
    about: "À propos",
    activeLanguage: "Langue",
    activeTheme: "Thème",
    cameraOrLibrary: "Choisir une image",
    drawing: "Dessin",
    history: "Historique",
    image: "Image",
    language: "Langue",
    meaning: "Sens",
    recognition: "Reconnaissance",
    results: "Résultats",
    search: "Recherche",
    searchPlaceholder: "Kanji, lecture ou sens",
    settings: "Réglages",
    strokeCount: "Traits",
    version: "Version"
  },
  "de-DE": {
    about: "Info",
    activeLanguage: "Sprache",
    activeTheme: "Design",
    drawing: "Zeichnung",
    history: "Verlauf",
    image: "Bild",
    recognition: "Erkennung",
    results: "Ergebnisse",
    search: "Suche",
    settings: "Einstellungen"
  },
  "it-IT": {
    about: "Informazioni",
    activeLanguage: "Lingua",
    activeTheme: "Tema",
    drawing: "Disegno",
    history: "Cronologia",
    image: "Immagine",
    recognition: "Riconoscimento",
    results: "Risultati",
    search: "Cerca",
    settings: "Impostazioni"
  },
  "pt-PT": {
    about: "Sobre",
    activeLanguage: "Idioma",
    activeTheme: "Tema",
    drawing: "Desenho",
    history: "Histórico",
    image: "Imagem",
    recognition: "Reconhecimento",
    results: "Resultados",
    search: "Pesquisar",
    searchPlaceholder: "Kanji, leitura ou significado",
    settings: "Definições"
  },
  "ja-JP": {
    about: "情報",
    activeLanguage: "言語",
    activeTheme: "テーマ",
    drawing: "手書き",
    history: "履歴",
    image: "画像",
    meaning: "意味",
    recognition: "認識",
    results: "結果",
    search: "検索",
    settings: "設定",
    strokeCount: "画数"
  },
  "zh-CN": {
    about: "关于",
    activeLanguage: "语言",
    activeTheme: "主题",
    drawing: "手写",
    history: "历史",
    image: "图像",
    recognition: "识别",
    results: "结果",
    search: "搜索",
    settings: "设置"
  },
  "zh-TW": {
    about: "關於",
    activeLanguage: "語言",
    activeTheme: "主題",
    drawing: "手寫",
    history: "紀錄",
    image: "影像",
    recognition: "辨識",
    results: "結果",
    search: "搜尋",
    settings: "設定"
  },
  "ko-KR": {
    about: "정보",
    activeLanguage: "언어",
    activeTheme: "테마",
    drawing: "그리기",
    history: "기록",
    image: "이미지",
    recognition: "인식",
    results: "결과",
    search: "검색",
    settings: "설정"
  },
  "ar-SA": {
    about: "حول",
    activeLanguage: "اللغة",
    activeTheme: "السمة",
    drawing: "الرسم",
    history: "السجل",
    image: "الصورة",
    recognition: "التعرّف",
    results: "النتائج",
    search: "البحث",
    settings: "الإعدادات"
  }
};

export const LANGUAGE_NAMES: Record<SupportedLocale, string> = {
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "es-ES": "Español",
  "fr-FR": "Français",
  "de-DE": "Deutsch",
  "it-IT": "Italiano",
  "pt-PT": "Português",
  "ja-JP": "日本語",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  "ko-KR": "한국어",
  "hi-IN": "हिन्दी",
  "ar-SA": "العربية",
  "sw-KE": "Kiswahili",
  "am-ET": "አማርኛ",
  "ha-NG": "Hausa",
  "yo-NG": "Yorùbá",
  "zu-ZA": "isiZulu"
};

export const THEME_LABELS: Record<ApplicationTheme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System"
};

export function isSupportedLocale(language: string): language is SupportedLocale {
  return SUPPORTED_LOCALES.includes(language as SupportedLocale);
}

export function normalizeLocale(language: string): SupportedLocale {
  return isSupportedLocale(language) ? language : "en-US";
}

export function translate(language: string, key: TranslationKey): string {
  const locale = normalizeLocale(language);
  return TRANSLATIONS[locale]?.[key] ?? ENGLISH_TRANSLATIONS[key];
}

export function getMeaningLanguagePriority(language: string): ReadonlyArray<string> {
  const locale = normalizeLocale(language);

  if (locale.startsWith("es")) {
    return ["es", "en"];
  }

  if (locale.startsWith("fr")) {
    return ["fr", "en"];
  }

  if (locale.startsWith("pt")) {
    return ["pt", "en"];
  }

  return ["en"];
}

export function getHistoryCategoryLabel(language: string, category: HistoryCategory): string {
  const labels: Record<HistoryCategory, TranslationKey> = {
    search: "searchHistory",
    visitedEntry: "visitedEntries",
    imageClassification: "imageClassification",
    drawingClassification: "drawingClassification"
  };

  return translate(language, labels[category]);
}
