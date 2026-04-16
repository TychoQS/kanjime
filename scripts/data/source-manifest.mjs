/**
 * Source metadata used by the automated data ingestion workflow.
 *
 * @inv Every source entry has a stable identifier and a deterministic local file name.
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
  }
];
