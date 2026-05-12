# KanjiMe

### Academic Context

This project is part of my Final Degree Project (TFG) for the Degree in Computer Science at the ULPGC.

Project name: KanjiMe

Author: Tycho Quintana Santana

### Data Attribution

This project packages locally processed and transformed data derived from the following sources:

- JMdict, provided by the Electronic Dictionary Research and Development Group (EDRDG): https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project
- KANJIDIC2, provided by the Electronic Dictionary Research and Development Group (EDRDG): https://www.edrdg.org/wiki/index.php/KANJIDIC_Project
- KanjiVG, provided by the KanjiVG project contributors: https://kanjivg.tagaini.net/

The application does not redistribute the original source datasets directly.
Instead, custom scripts are used to process and transform the original data into application-specific formats.

The recognition model used by this project was trained using ETL9B, part of the ETL Character Database, provided by the National Institute of Advanced Industrial Science and Technology (AIST), Japan:
https://etlcdb.db.aist.go.jp/?lang=en

The original datasets remain subject to their respective licenses and attribution requirements.

#### Database Generation

Since the processed database is not included in this repository, it must be generated locally before running the application. To download the necessary sources and build the packaged SQLite database, execute the following command:

```bash
npm run data:prepare
```

### Copyright

All rights reserved unless otherwise stated.