/// <reference lib="webworker" />

import { concatMap, from, Subject } from 'rxjs';
import { DbEventType } from '../models/db-event-type.model';
import { ValuesLoadedFromDb } from '../shared/stores/features/loaded-from-db.store.feature';
import { settingsDb } from './settings.db';
import { NewGlobalSettings } from './settings.model';

const updateQueue = new Subject<NewGlobalSettings>();
const updateQueueSubscription = updateQueue.pipe(
  // TODO: May want to do something to make sure the db is populated before pushing new items.
  // TODO: Also, maybe delay a bit so we aren't constantly writing to the database.
  concatMap((settings: NewGlobalSettings) => {
    return from(settingsDb.settings.update('user', { ...settings }));
  }),
).subscribe({
  next: (numUpdated: number) => {
    // console.warn('Settings db updated', numUpdated);
  },
  error: (error: unknown) => {
    console.warn('db update error', error);
  }
});

addEventListener('message', ({ data }: MessageEvent<{
  eventType: DbEventType;
  settings: NewGlobalSettings & Partial<ValuesLoadedFromDb>;
}>) => {
  // If the hasLoaded property is on the object, delete it so it doesn't get stored in the database.
  // TODO: Check event type and use this instead of calling the add directly in the retrieval script.
  if (data?.settings && Object.hasOwn(data.settings, 'hasLoaded')) {
    delete data.settings.hasLoaded;
  }

  if (data.eventType === 'update') {
    updateQueue.next(data.settings);
  } else if (data.eventType === 'add') {
    void (async () => {
      await settingsDb.settings.put(data.settings, 'user');
    })();
  } else if (data.eventType === 'export') {
    void (async () => {
      const result = await settingsDb.exportDb();
      console.warn('result', result);
    })();
  }
});

