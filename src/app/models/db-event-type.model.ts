import { PropModification, UpdateSpec } from 'dexie';
import { DbBase, InsertDbType } from '../scheduler-base/models/db.types';

export type UpdateSpecWithoutPropModification<T> = {
  [K in keyof UpdateSpec<T>]: Exclude<UpdateSpec<T>[K], PropModification>;
};

export type DbEventType = 'add' | 'update' | 'delete' | 'export';

export type DbWorkerChange<T extends DbBase> = {
  eventType: Exclude<DbEventType, 'export' | 'add' | 'delete'>,
  id: number,
  data: UpdateSpecWithoutPropModification<T>, // InsertDbType<T> | UpdateDbChanges<T>,
};

export type DbWorkerAdd<R extends DbBase, T extends InsertDbType<R>> = {
  eventType: Extract<DbEventType, 'add'>,
  data: UpdateSpecWithoutPropModification<T>, // InsertDbType<T> | UpdateDbChanges<T>,
};

export type DbWorkerExport = {
  eventType: Extract<DbEventType, 'export'>,
  tables?: Array<string> | 'full',
};

export type DbWorkerDelete = {
  eventType: Extract<DbEventType, 'delete'>;
  id: number;
};

export type DbWorkerChangeOrExport<T extends DbBase> = DbWorkerChange<T> | DbWorkerExport;

export type DbWorkerModification<T extends DbBase, A extends InsertDbType<T> | void> = DbWorkerChange<T> | DbWorkerAdd<T, A extends InsertDbType<T> ? A : InsertDbType<T>> | DbWorkerExport | DbWorkerDelete;
