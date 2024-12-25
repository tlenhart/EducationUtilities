import { patchState, signalMethod, signalStore, signalStoreFeature, withMethods } from '@ngrx/signals';
import { addEntity, removeEntity, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { schedulerDb } from '../db/scheduler.db';
import { DbScheduleChanges, Schedule } from '../models/schedule.model';
import { withSelectedEntity } from '../../shared/stores/features/selected-entity.store.feature';

export const ScheduleStore = signalStore(
  withEntities<Schedule>(),
  withLoadSchedules(),
  withSelectedEntity(),
  withMethods((store) => ({
    async addSchedule(schedule: DbScheduleChanges): Promise<void> {
      const key = await schedulerDb.schedules.add(schedule);

      if (key) {
        const newSchedule = schedule as Schedule;
        newSchedule.id = key;
        patchState(store, addEntity(newSchedule));
        // patchState(store, addEntity({
        //   id: key,
        //   ...schedule,
        // } as Schedule));
      } else {
        console.error('Error adding schedule to db.');
      }
    },
    removeSchedule(schedule: Schedule): void {
      patchState(store, removeEntity(schedule.id));
    },
  })),
);

function withLoadSchedules() {
  return signalStoreFeature(
    withMethods((store) => ({
      loadSchedules: signalMethod<void>(async () => {
        try {
          const schedules = await schedulerDb.schedules.toArray();

          patchState(store, setAllEntities(schedules));
        } catch (e: unknown) {
          // TODO: Clear the database.
          console.error('Error while loading schedules from the local db.', e);
        }
      }),
    })),
  );
}
