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
      {entries.length === 0 ? (
        <p style={{ color: "var(--ion-color-medium)", textAlign: "center", width: "100%" }}>
          No history entries are available.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, width: "100%" }}>
          {entries.map(entry => {
            const isRepeatedCharacter = seenCharacters.has(entry.character);
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
                  <span className="result-meta">{entry.summary}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}