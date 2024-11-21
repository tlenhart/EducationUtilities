export interface DbBase {
  id: number;
}

export type InsertDbType<T extends DbBase> =
  Omit<T, keyof DbBase>;

export type UpdateDbChanges<T extends DbBase> =
  Partial<Omit<T, keyof DbBase>>;
// export type UpdateDbType<T extends DbBase> =
//   Partial<DbBase> & Omit<T, keyof DbBase>;
// We don't want partial here.

// See: https://dexie.org/docs/Table/Table.update()
// export enum DbUpdateSuccess {
//   KeyNotFound = 0,
//   Success = 1,
// }
