import type { HistoryProps } from "./Contracts/HistoryProps";

/**
 * History list grouped by source category.
 */
export function HistoryView(props: HistoryProps): JSX.Element {
  const entries = props.groups.flatMap(group => (
    group.entries.map(entry => ({
      ...entry,
      category: group.category
    }))
  )).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const seenCharacters = new Set<string>();

  return (
    <section data-testid="history-view" className="resultList">
      {entries.length === 0 ? (
        <p>No history entries are available.</p>
      ) : (
        <ul>
          {entries.map(entry => (
            <li key={`${entry.category}-${entry.character}-${entry.createdAt}`}>
              {(() => {
                const isRepeatedCharacter = seenCharacters.has(entry.character);
                seenCharacters.add(entry.character);

                return (
              <button
                aria-label={isRepeatedCharacter ? entry.createdAt : entry.character}
                className="resultButton"
                data-testid={`history-entry-${entry.category}-${entry.character}`}
                onClick={() => props.onEntrySelected(entry.character)}
                type="button"
              >
                <span aria-hidden="true">{entry.character}</span>
                <span>{entry.summary}</span>
                <time dateTime={entry.createdAt}>{entry.createdAt}</time>
              </button>
                );
              })()}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
