import { PowerSyncDatabase } from "@powersync/react-native";
import { OPSqliteOpenFactory } from "@powersync/op-sqlite";
import { MANAGER_POWERSYNC_DB_FILENAME } from "@mfc/manager-sync-model";

import { powerSyncSchema } from "./schema";

const powerSyncFactory = new OPSqliteOpenFactory({
  dbFilename: MANAGER_POWERSYNC_DB_FILENAME,
});

export const powerSync = new PowerSyncDatabase({
  schema: powerSyncSchema,
  database: powerSyncFactory,
});
