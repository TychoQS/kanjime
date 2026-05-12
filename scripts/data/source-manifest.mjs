/**
 * Source metadata used by the automated data ingestion workflow.
 *
 */
export const DATA_SOURCE_DEFINITIONS = [
  {
    id: "jmdict",
    displayName: "JMdict",
    sourceType: "direct",
    url: "https://www.edrdg.org/ftp/pub/Nihongo/JMdict_e.gz",
    fallbackUrls: ["http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz"],
    compressedFileName: "JMdict_e.gz",
    expandedFileName: "JMdict_e.xml",
    compression: "gzip",
    homepage: "https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project",
    attribution: "Electronic Dictionary Research and Development Group",
    license: "EDRDG licence statement"
  },
  {
    id: "kanjidic2",
    displayName: "KANJIDIC2",
    sourceType: "direct",
    url: "https://www.edrdg.org/kanjidic/kanjidic2.xml.gz",
    compressedFileName: "kanjidic2.xml.gz",
    expandedFileName: "kanjidic2.xml",
    compression: "gzip",
    homepage: "https://www.edrdg.org/wiki/index.php/KANJIDIC_Project",
    attribution: "Electronic Dictionary Research and Development Group",
    license: "EDRDG licence statement"
  },
  {
    id: "kanjivg",
    displayName: "KanjiVG",
    sourceType: "githubReleaseAsset",
    releaseApiUrl: "https://api.github.com/repos/KanjiVG/kanjivg/releases/latest",
    assetFilePattern: "kanjivg.*\\.xml(?:\\.gz)?$",
    compressedFileName: "kanjivg.xml.gz",
    expandedFileName: "kanjivg.xml",
    compression: "gzip",
    homepage: "https://kanjivg.tagaini.net/",
    attribution: "KanjiVG project contributors",
    license: "Creative Commons Attribution-Share Alike 3.0"
  },
  {
    id: "etl9b",
    displayName: "ETL9B",
    sourceType: "manual",
    url: "https://etlcdb.db.aist.go.jp/download2/",
    homepage: "https://etlcdb.db.aist.go.jp/?lang=en",
    attribution: "Electrotechnical Laboratory, Japanese Technical Committee for Optical Character Recognition",
    license: "ETL Character Database Terms of Use",
    upstreamVersion: "ETL9B"
  }
];
