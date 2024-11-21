import { computed } from '@angular/core';
import { patchState, signalStore, signalStoreFeature, type, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  EntityId,
  EntityState, NamedEntityState,
  removeEntity, updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Teacher } from '../models/teacher.model';

interface TeacherState extends NamedEntityState<Teacher, 'teacher'> {
  teachers: Array<Teacher>;
  isLoading: boolean;
  filter: { query: string, order: 'asc' | 'desc' };
}

const initialState: TeacherState = {
  teachers: [
    {
      id: 1,
      name: 'Mr. Anderson',
      availability: [],
      homeroom: 'Computers',
    },
    {
      id: 2,
      name: 'Mr. Bueller',
      availability: [],
      homeroom: 'GenPop',
    },
    {
      id: 3,
      name: 'Mr. Lorensax',
      availability: [],
      homeroom: 'Econ 101',
    },
  ],
  isLoading: false,
  filter: { query: '', order: 'desc' },
  // teacherIds: [], // [1, 2, 3],
  // teacherEntityMap: {},
} as unknown as TeacherState;

const teacherStoreConfig = entityConfig({
  entity: type<Teacher>(),
  collection: 'teacher',
  // selectId: (teacher: Teacher) => teacher.id,
});

export const TeacherStore = signalStore(
  withState(initialState),
  withEntities<Teacher>(teacherStoreConfig),
  // withSelectedEntity(),
  withMethods((store) => ({
    addTeacher(teacher: Teacher): void {
      patchState(store, addEntity(teacher, teacherStoreConfig));
    },
    updateTeacher(id: number, changes: Partial<Teacher>): void {
      patchState(store, updateEntity({
        id: id,
        changes: (teacher) => ({ name: changes.name }),
        // changes: {
        //   name: changes.name,
        // },
      }));
    },
    removeTeacher(teacher: Teacher): void {
      patchState(store, removeEntity(teacher.id, teacherStoreConfig));
    },
  })),
);
