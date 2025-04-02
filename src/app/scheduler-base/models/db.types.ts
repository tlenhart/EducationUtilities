import { UpdateSpecWithoutPropModification } from '../../models/db-event-type.model';

export interface DbBase<T = number> {
  id: T;
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
/* eslint-disable @stylistic/indent */ // TODO: Fix rules so this isn't required.
export type toDbFn<TModel, TDbType> = (model: UpdateSpecWithoutPropModification<TModel>, id?: number) =>
  UpdateSpecWithoutPropModification<TDbType>;
/* eslint-enable @stylistic/indent */

export type fromDbFn<TDbType, TModel> = (dbModel: TDbType) => TModel;
