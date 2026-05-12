import { translate, type TranslationKey } from "../../../Shared/I18n";
import type { AboutInformationItem } from "../../../Shared/DomainTypes";

interface AboutListViewProps {
  readonly items: ReadonlyArray<AboutInformationItem>;
  readonly language: string;
}


export function AboutListView(props: AboutListViewProps): JSX.Element {
  return (
    <dl className="about-list" data-testid="about-list">
      {props.items.map(item => (
        <div key={`${item.label}-${item.value}`} className="about-row" data-testid={`about-row-${item.label}`}>
          <dt>{translate(props.language, item.label as TranslationKey) ?? item.label}</dt>
          <dd>{localizeAboutValue(props.language, item.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function localizeAboutValue(language: string, value: string): string {
  if (value.startsWith("__MODEL_DETAIL__:")) {
    const count = value.split(":")[1];
    return translate(language, "modelDetail").replace("{{count}}", count);
  }

  const keys: ReadonlyArray<string> = [
    "licenseDetail",
    "termsDetail",
    "authorshipName",
    "modelDetailEmpty",
    "textConversionValue",
    "interfaceValue"
  ];

  if (keys.includes(value)) {
    return translate(language, value as TranslationKey);
  }

  if (value.includes("databaseSourceDetail")) {
    return value.replace("databaseSourceDetail", translate(language, "databaseSourceDetail"));
  }

  if (value.includes("modelSourceDetail")) {
    return value.replace("modelSourceDetail", translate(language, "modelSourceDetail"));
  }

  return value;
}
