import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    tempTwoFactorSecret?: string;
  }
}

declare module 'connect-pg-simple' {
  import session from 'express-session';
  import { Pool } from 'pg';

  interface PgSessionStoreOptions {
    pool?: Pool;
    tableName?: string;
    schemaName?: string;
    pruneSessionInterval?: number | false;
    errorLog?: (...args: any[]) => void;
  }

  function connectPgSimple(session: typeof session): {
    new (options?: PgSessionStoreOptions): session.Store;
  };

  export = connectPgSimple;
}
