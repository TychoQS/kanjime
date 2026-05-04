import type { HistoryProps } from "./Contracts/HistoryProps";

export function HistoryView(props: HistoryProps): JSX.Element {
  const entries = props.groups.flatMap(group => (
    group.entries.map(entry => ({
      ...entry,
      category: group.category
    }))
  ).sort((left, right) => right.createdAt.localeCompare(left.createdAt)));
  const seenCharacters = new Set<string>();

  return (
    <div className="result-list scroll-list" data-testid="history-view">
      {entries.length > 0 ? (
        <ul className="plain-list">
          {entries.map(entry => {
            const isRepeatedCharacter = seenCharacters.has(entry.character);
            const readingSummary = entry.summary === entry.character ? "" : entry.summary;
            const formattedDate = formatHistoryDate(entry.createdAt);
            seenCharacters.add(entry.character);

            return (
              <li key={`${entry.category}-${entry.character}-${entry.createdAt}`} data-timestamp={entry.createdAt}>
                <button
                  aria-label={isRepeatedCharacter ? entry.createdAt : entry.character}
                  className="result-row"
                  data-testid={`history-entry-${entry.category}-${entry.character}`}
                  onClick={() => props.onEntrySelected(entry.character)}
                  type="button"
                >
                  <span className="result-kanji" aria-hidden="true">{entry.character}</span>
                  <span className="result-meta">{readingSummary || formattedDate}</span>
                  {readingSummary.length > 0 ? <span className="result-levels">{formattedDate}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function formatHistoryDate(createdAt: string): string {
  if (createdAt.length >= 10 && createdAt[4] === "-" && createdAt[7] === "-") {
    return createdAt.slice(0, 10);
  }

  return createdAt;
}
