import packageJson from "../../package.json" with { type: "json" };
import dataSourceAttributions from "../../public/assets/attributions/data-sources.json" with { type: "json" };
import packagedDatabaseMetadata from "../../public/assets/database/kanji.metadata.json" with { type: "json" };
import modelClasses from "../../public/assets/model/classes.json" with { type: "json" };

/**
 * Static metadata extracted from repository artifacts for test inputs.
 */
export const PROJECT_METADATA = {
  packageName: packageJson.name,
  version: packageJson.version,
  classCount: packagedDatabaseMetadata.classCount,
  dataSources: dataSourceAttributions.sources,
  primaryCharacter: modelClasses[0] ?? "一",
  secondaryCharacter: modelClasses[1] ?? modelClasses[0] ?? "丁",
  thirdCharacter: modelClasses[2] ?? modelClasses[0] ?? "七",
  aboutInformation: [
    {
      label: "Version",
      value: packageJson.version
    },
    {
      label: "Data sources",
      value: String(dataSourceAttributions.sources.length)
    },
    {
      label: "Classifier classes",
      value: String(packagedDatabaseMetadata.classCount)
    }
  ]
} as const;
