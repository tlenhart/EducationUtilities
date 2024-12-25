import { signalStoreFeature, withHooks, withMethods, withProps } from '@ngrx/signals';
import { DbBase, InsertDbType } from '../../../scheduler-base/models/db.types';
import { DbWorkerAdd, DbWorkerChange, DbWorkerDelete, UpdateSpecWithoutPropModification } from '../../../models/db-event-type.model';

// TODO: If passing in the worker path doesn't work, pass in the worker itself.
export function withPartialBackgroundSaveToDb(worker: Worker) {
  return signalStoreFeature(
    withProps((store) => ({
      // _dbWorker: new Worker(new URL(workerPath, import.meta.url), { type: 'module' }), // TODO: Check for worker support.
      _dbWorker: worker, // TODO: Check for worker support.
    } as { _dbWorker: Worker | null})),
    withHooks({
      onInit(store) {
        // store._dbWorker?.onmessage
        // store._dbWorker = new Worker(new URL(workerPath, import.meta.url), { type: 'module' });
      },
      onDestroy(store) {
        store._dbWorker?.terminate();
      },
    }),
    withMethods((store) => ({
      addToDb<R extends DbBase, T extends InsertDbType<R>>(newEntry: T): void {
        store._dbWorker?.postMessage({ eventType: 'add', data: newEntry } as DbWorkerAdd<R, T>);
      },
      // TODO: Wrap in effect perhaps?
      updateDb<T extends DbBase>(id: number, changes: UpdateSpecWithoutPropModification<T>): void {
        store._dbWorker?.postMessage({ eventType: 'update', data: changes, id: id } as DbWorkerChange<DbBase>);
      },
      removeFromDb(id: number): void {
        store._dbWorker?.postMessage({ eventType: 'delete', id: id } as DbWorkerDelete);
      },
    })),
  );
}
