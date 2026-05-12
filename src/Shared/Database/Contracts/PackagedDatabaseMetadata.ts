/**
 * Metadata generated alongside the packaged SQLite database.
 *
 * @inv The database asset path always points to a bundled application asset.
 */
export interface PackagedDatabaseMetadata {
  /**
   * Schema version used to build the packaged database.
   *
   * @post The value is a positive integer.
   */
  schemaVersion: number;

  /**
   * Timestamp for the database build artifact.
   *
   * @post The value is an ISO-8601 timestamp.
   */
  builtAt: string;

  /**
   * Number of classifier classes represented in the packaged database.
   *
   * @post The value is zero or greater.
   */
  classCount: number;

  /**
   * Relative asset path for the packaged SQLite database.
   *
   * @post The value points to a bundled asset available in development and packaged runtimes.
   */
  packagedDatabaseAssetPath: string;

  /**
   * Data source descriptors used to build the packaged database.
   *
   * @post Every source descriptor belongs to the build reflected by this metadata object.
   */
  sources: ReadonlyArray<{
    id: string;
    downloadUrl: string;
    downloadedAt: string;
    upstreamVersion: string | null;
    expandedSha256: string;
  }>;
}

