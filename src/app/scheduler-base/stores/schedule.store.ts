import { patchState, signalStore, withMethods } from '@ngrx/signals';
import { addEntity, removeEntity, withEntities } from '@ngrx/signals/entities';
import { Schedule } from '../models/schedule.model';

export const ScheduleStore = signalStore(
  withEntities<Schedule>(),
  withMethods((store) => ({
    addSchedule(schedule: Schedule): void {
      patchState(store, addEntity(schedule));
    },
    removeSchedule(schedule: Schedule): void {
      patchState(store, removeEntity(schedule.id));
    },
  })),
);
