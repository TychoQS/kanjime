export const SUPPORTED_LANGUAGES = [
  "en-US",
  "en-GB",
  "es-ES",
  "fr-FR",
  "de-DE",
  "it-IT",
  "pt-PT",
  "zh-CN",
  "ja-JP",
  "ko-KR",
  "ar-EG",
  "sw-KE"
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export type TranslationKey =
  | "appName"
  | "loadingModel"
  | "navigation"
  | "openMenu"
  | "closeMenu"
  | "ocr"
  | "search"
  | "history"
  | "about"
  | "theme"
  | "language"
  | "system"
  | "light"
  | "dark"
  | "imageMode"
  | "drawingMode"
  | "takePhoto"
  | "pickImage"
  | "chooseFile"
  | "identify"
  | "clear"
  | "drawHere"
  | "drawingHelp"
  | "imageEmpty"
  | "results"
  | "noResults"
  | "searchPlaceholder"
  | "searchEmpty"
  | "kanjiDetail"
  | "copy"
  | "back"
  | "radical"
  | "components"
  | "meanings"
  | "readings"
  | "kunyomi"
  | "onyomi"
  | "examples"
  | "strokeCount"
  | "strokeOrder"
  | "levels"
  | "historyEmpty"
  | "searchHistory"
  | "visitedHistory"
  | "imageHistory"
  | "drawingHistory"
  | "version"
  | "license"
  | "author"
  | "acknowledgements"
  | "terms"
  | "copySuccess"
  | "unexpectedError";

type TranslationCatalog = Readonly<Record<TranslationKey, string>>;

const EN_US: TranslationCatalog = {
  appName: "Kanji OCR",
  loadingModel: "Preparing character recognition",
  navigation: "Navigation",
  openMenu: "Open navigation",
  closeMenu: "Close navigation",
  ocr: "OCR",
  search: "Search",
  history: "History",
  about: "About",
  theme: "Theme",
  language: "Language",
  system: "System",
  light: "Light",
  dark: "Dark",
  imageMode: "Image",
  drawingMode: "Drawing",
  takePhoto: "Take photo",
  pickImage: "Photo library",
  chooseFile: "Choose image",
  identify: "Identify",
  clear: "Clear",
  drawHere: "Draw here",
  drawingHelp: "Draw one or more strokes to identify a character.",
  imageEmpty: "Add an image to identify a character.",
  results: "Results",
  noResults: "No results are available.",
  searchPlaceholder: "Kanji, reading, or meaning",
  searchEmpty: "Enter a term to search the local dictionary.",
  kanjiDetail: "Kanji detail",
  copy: "Copy",
  back: "Back",
  radical: "Radical",
  components: "Components",
  meanings: "Meanings",
  readings: "Readings",
  kunyomi: "Kunyomi",
  onyomi: "Onyomi",
  examples: "Examples",
  strokeCount: "Stroke count",
  strokeOrder: "Stroke order",
  levels: "Levels",
  historyEmpty: "No history entries are available.",
  searchHistory: "Searches",
  visitedHistory: "Visited entries",
  imageHistory: "Image classifications",
  drawingHistory: "Drawing classifications",
  version: "Version",
  license: "Licence",
  author: "Author",
  acknowledgements: "Acknowledgements",
  terms: "Terms of use",
  copySuccess: "The character was copied.",
  unexpectedError: "An unexpected error has occurred and the character could not be identified."
};

export const TRANSLATIONS: Readonly<Record<SupportedLanguage, TranslationCatalog>> = {
  "en-US": EN_US,
  "en-GB": {
    ...EN_US,
    license: "Licence"
  },
  "es-ES": {
    appName: "OCR de kanji",
    loadingModel: "Preparando el reconocimiento de caracteres",
    navigation: "Navegación",
    openMenu: "Abrir navegación",
    closeMenu: "Cerrar navegación",
    ocr: "OCR",
    search: "Buscar",
    history: "Historial",
    about: "Acerca de",
    theme: "Tema",
    language: "Idioma",
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro",
    imageMode: "Imagen",
    drawingMode: "Dibujo",
    takePhoto: "Tomar foto",
    pickImage: "Fototeca",
    chooseFile: "Elegir imagen",
    identify: "Identificar",
    clear: "Limpiar",
    drawHere: "Dibuja aquí",
    drawingHelp: "Dibuja uno o varios trazos para identificar un carácter.",
    imageEmpty: "Añade una imagen para identificar un carácter.",
    results: "Resultados",
    noResults: "No hay resultados disponibles.",
    searchPlaceholder: "Kanji, lectura o significado",
    searchEmpty: "Introduce un término para buscar en el diccionario local.",
    kanjiDetail: "Detalle del kanji",
    copy: "Copiar",
    back: "Volver",
    radical: "Radical",
    components: "Componentes",
    meanings: "Significados",
    readings: "Lecturas",
    kunyomi: "Kunyomi",
    onyomi: "Onyomi",
    examples: "Ejemplos",
    strokeCount: "Número de trazos",
    strokeOrder: "Orden de trazos",
    levels: "Niveles",
    historyEmpty: "No hay entradas de historial.",
    searchHistory: "Búsquedas",
    visitedHistory: "Entradas visitadas",
    imageHistory: "Clasificaciones por imagen",
    drawingHistory: "Clasificaciones por dibujo",
    version: "Versión",
    license: "Licencia",
    author: "Autoría",
    acknowledgements: "Agradecimientos",
    terms: "Términos de uso",
    copySuccess: "El carácter se ha copiado.",
    unexpectedError: "Ha ocurrido un error inesperado y no se ha podido identificar el carácter."
  },
  "fr-FR": {
    ...EN_US,
    search: "Recherche",
    history: "Historique",
    about: "À propos",
    theme: "Thème",
    language: "Langue",
    system: "Système",
    light: "Clair",
    dark: "Sombre",
    imageMode: "Image",
    drawingMode: "Dessin",
    takePhoto: "Prendre une photo",
    pickImage: "Photothèque",
    chooseFile: "Choisir une image",
    identify: "Identifier",
    clear: "Effacer",
    drawHere: "Dessinez ici",
    results: "Résultats",
    copy: "Copier",
    back: "Retour",
    meanings: "Sens",
    readings: "Lectures",
    examples: "Exemples",
    strokeCount: "Nombre de traits",
    strokeOrder: "Ordre des traits",
    noResults: "Aucun résultat disponible.",
    unexpectedError: "Une erreur inattendue s’est produite et le caractère n’a pas pu être identifié."
  },
  "de-DE": {
    ...EN_US,
    search: "Suche",
    history: "Verlauf",
    about: "Info",
    theme: "Design",
    language: "Sprache",
    system: "System",
    light: "Hell",
    dark: "Dunkel",
    drawingMode: "Zeichnung",
    takePhoto: "Foto aufnehmen",
    pickImage: "Fotomediathek",
    chooseFile: "Bild auswählen",
    identify: "Erkennen",
    clear: "Löschen",
    drawHere: "Hier zeichnen",
    results: "Ergebnisse",
    copy: "Kopieren",
    back: "Zurück",
    meanings: "Bedeutungen",
    readings: "Lesungen",
    strokeCount: "Strichzahl",
    strokeOrder: "Strichfolge",
    noResults: "Keine Ergebnisse verfügbar.",
    unexpectedError: "Ein unerwarteter Fehler ist aufgetreten und das Zeichen konnte nicht erkannt werden."
  },
  "it-IT": {
    ...EN_US,
    search: "Cerca",
    history: "Cronologia",
    about: "Informazioni",
    theme: "Tema",
    language: "Lingua",
    system: "Sistema",
    light: "Chiaro",
    dark: "Scuro",
    drawingMode: "Disegno",
    takePhoto: "Scatta foto",
    pickImage: "Libreria foto",
    chooseFile: "Scegli immagine",
    identify: "Identifica",
    clear: "Cancella",
    drawHere: "Disegna qui",
    results: "Risultati",
    copy: "Copia",
    back: "Indietro",
    meanings: "Significati",
    readings: "Letture",
    strokeCount: "Numero di tratti",
    strokeOrder: "Ordine dei tratti",
    noResults: "Nessun risultato disponibile.",
    unexpectedError: "Si è verificato un errore imprevisto e il carattere non è stato identificato."
  },
  "pt-PT": {
    ...EN_US,
    search: "Pesquisar",
    history: "Histórico",
    about: "Acerca",
    theme: "Tema",
    language: "Idioma",
    system: "Sistema",
    light: "Claro",
    dark: "Escuro",
    drawingMode: "Desenho",
    takePhoto: "Tirar fotografia",
    pickImage: "Fototeca",
    chooseFile: "Escolher imagem",
    identify: "Identificar",
    clear: "Limpar",
    drawHere: "Desenhe aqui",
    results: "Resultados",
    copy: "Copiar",
    back: "Voltar",
    meanings: "Significados",
    readings: "Leituras",
    strokeCount: "Número de traços",
    strokeOrder: "Ordem dos traços",
    noResults: "Não existem resultados disponíveis.",
    unexpectedError: "Ocorreu um erro inesperado e não foi possível identificar o carácter."
  },
  "zh-CN": {
    ...EN_US,
    appName: "汉字识别",
    loadingModel: "正在准备字符识别",
    navigation: "导航",
    search: "搜索",
    history: "历史",
    about: "关于",
    theme: "主题",
    language: "语言",
    system: "系统",
    light: "浅色",
    dark: "深色",
    imageMode: "图片",
    drawingMode: "手写",
    takePhoto: "拍照",
    pickImage: "相册",
    chooseFile: "选择图片",
    identify: "识别",
    clear: "清除",
    drawHere: "在此书写",
    results: "结果",
    copy: "复制",
    back: "返回",
    meanings: "释义",
    readings: "读音",
    strokeCount: "笔画数",
    strokeOrder: "笔顺",
    noResults: "没有可用结果。",
    unexpectedError: "发生意外错误，无法识别该字符。"
  },
  "ja-JP": {
    ...EN_US,
    appName: "漢字OCR",
    loadingModel: "文字認識を準備しています",
    navigation: "ナビゲーション",
    search: "検索",
    history: "履歴",
    about: "情報",
    theme: "テーマ",
    language: "言語",
    system: "システム",
    light: "ライト",
    dark: "ダーク",
    imageMode: "画像",
    drawingMode: "手書き",
    takePhoto: "写真を撮る",
    pickImage: "写真ライブラリ",
    chooseFile: "画像を選択",
    identify: "識別",
    clear: "消去",
    drawHere: "ここに書く",
    results: "結果",
    copy: "コピー",
    back: "戻る",
    meanings: "意味",
    readings: "読み",
    strokeCount: "画数",
    strokeOrder: "筆順",
    noResults: "結果はありません。",
    unexpectedError: "予期しないエラーが発生し、文字を識別できませんでした。"
  },
  "ko-KR": {
    ...EN_US,
    appName: "한자 OCR",
    loadingModel: "문자 인식을 준비하는 중",
    navigation: "탐색",
    search: "검색",
    history: "기록",
    about: "정보",
    theme: "테마",
    language: "언어",
    system: "시스템",
    light: "밝게",
    dark: "어둡게",
    imageMode: "이미지",
    drawingMode: "그리기",
    takePhoto: "사진 촬영",
    pickImage: "사진 보관함",
    chooseFile: "이미지 선택",
    identify: "식별",
    clear: "지우기",
    drawHere: "여기에 쓰기",
    results: "결과",
    copy: "복사",
    back: "뒤로",
    meanings: "의미",
    readings: "읽기",
    strokeCount: "획수",
    strokeOrder: "획순",
    noResults: "사용 가능한 결과가 없습니다.",
    unexpectedError: "예기치 않은 오류가 발생하여 문자를 식별할 수 없습니다."
  },
  "ar-EG": {
    ...EN_US,
    appName: "تعرف الكانجي",
    loadingModel: "جار تجهيز التعرف على الحروف",
    navigation: "التنقل",
    search: "بحث",
    history: "السجل",
    about: "حول",
    theme: "المظهر",
    language: "اللغة",
    system: "النظام",
    light: "فاتح",
    dark: "داكن",
    imageMode: "صورة",
    drawingMode: "رسم",
    takePhoto: "التقاط صورة",
    pickImage: "مكتبة الصور",
    chooseFile: "اختيار صورة",
    identify: "تعرف",
    clear: "مسح",
    drawHere: "ارسم هنا",
    results: "النتائج",
    copy: "نسخ",
    back: "رجوع",
    meanings: "المعاني",
    readings: "القراءات",
    strokeCount: "عدد الضربات",
    strokeOrder: "ترتيب الضربات",
    noResults: "لا توجد نتائج متاحة.",
    unexpectedError: "حدث خطأ غير متوقع ولم يمكن التعرف على الحرف."
  },
  "sw-KE": {
    ...EN_US,
    appName: "Utambuzi wa Kanji",
    loadingModel: "Inaandaa utambuzi wa herufi",
    navigation: "Urambazaji",
    search: "Tafuta",
    history: "Historia",
    about: "Kuhusu",
    theme: "Mandhari",
    language: "Lugha",
    system: "Mfumo",
    light: "Angavu",
    dark: "Giza",
    imageMode: "Picha",
    drawingMode: "Mchoro",
    takePhoto: "Piga picha",
    pickImage: "Maktaba ya picha",
    chooseFile: "Chagua picha",
    identify: "Tambua",
    clear: "Futa",
    drawHere: "Chora hapa",
    results: "Matokeo",
    copy: "Nakili",
    back: "Rudi",
    meanings: "Maana",
    readings: "Matamshi",
    strokeCount: "Idadi ya mipigo",
    strokeOrder: "Mpangilio wa mipigo",
    noResults: "Hakuna matokeo yanayopatikana.",
    unexpectedError: "Hitilafu isiyotarajiwa imetokea na herufi haikuweza kutambuliwa."
  }
};

/**
 * Resolves a supported language.
 *
 * @param language Candidate language code.
 * @returns Supported language or the default fallback.
 *
 * @post The returned language has a translation catalog.
 */
export function resolveSupportedLanguage(language: string): SupportedLanguage {
  return SUPPORTED_LANGUAGES.find(candidate => candidate === language) ?? "en-US";
}

/**
 * Returns localized text.
 *
 * @param language Active language.
 * @param key Translation key.
 * @returns Localized string.
 *
 * @post Missing catalog values fall back to American English.
 */
export function translate(language: string, key: TranslationKey): string {
  const supportedLanguage = resolveSupportedLanguage(language);

  return TRANSLATIONS[supportedLanguage][key] ?? TRANSLATIONS["en-US"][key];
}
