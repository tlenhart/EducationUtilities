import { effect, inject } from '@angular/core';
import { patchState, signalStore, signalStoreFeature, type, withHooks, withMethods } from '@ngrx/signals';
import {
  addEntity,
  entityConfig,
  EntityId,
  removeEntity,
  updateEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { eduUtilsDb } from '../../core/db/edu-utils.db';
import { UpdateSpecWithoutPropModification } from '../../models/db-event-type.model';
import { BehaviorId } from '../../models/observation.model';
import { InsertDbType } from '../../scheduler-base/models/db.types';
import { PersonId, toDbPerson } from '../../scheduler-base/models/person-type.model';
import {
  DbStudent,
  DbStudentChanges,
  fromDbStudent,
  fromDbStudents,
  Student,
  toDbStudent,
} from '../../scheduler-base/models/student.model';
import { withMultipleSelectedEntities } from './features/multiple-selected-entities.store.feature';
import { withAutomaticallyLoadEntities } from './features/schedule-id-changes.store.feature';
import { ObservationBehaviorStore } from './observation-behavior.store';

const studentEntityConfig = entityConfig({
  entity: type<Student>(),
});

export const StudentStore = signalStore(
  withEntities(studentEntityConfig),
  // withLoadingStatus(),
  withMultipleSelectedEntities<Student, DbStudent, PersonId, DbStudentChanges>(eduUtilsDb.students, fromDbStudent),
  withAutomaticallyLoadEntities<Student, DbStudent, PersonId, DbStudentChanges>(eduUtilsDb.students, fromDbStudents),
  // withPartialBackgroundSaveToDb(new Worker(new URL('./student.db.worker.ts', import.meta.url), { type: 'module' })),
  withMethods((store) => ({
    async addStudent(student: InsertDbType<Student>): Promise<PersonId> {
      // store.addToDb(student); // ! Won't work because we need the id back.
      // TODO: Handle errors here!

      const id = await eduUtilsDb.students.put(toDbPerson(student));

      const newStudent: Student = {
        ...student,
        id: id,
      };
      patchState(store, addEntity(newStudent)); // TODO: Will this trigger the live query and get everything reloaded?

      return id;
    },
    async updateStudent(id: PersonId | null, changes: UpdateSpecWithoutPropModification<Student>, customPatchMethod?: (store: InstanceType<typeof StudentStore>, id: PersonId, changes: UpdateSpecWithoutPropModification<Student>) => void): Promise<void> {
      if (id) {
        // TODO: Check for success? (Or perform rollback?)
        // TODO: Notify of errors.

        const dbStudent: UpdateSpecWithoutPropModification<DbStudent> = toDbStudent(id, changes);
        const entriesUpdated: number = await eduUtilsDb.students.update(id, { ...dbStudent });

        // Only patch the state when the database update succeeded.
        if (entriesUpdated === 1) {
          // patchState(
          //   store,
          //   updateEntity({
          //     id: id,
          //     // changes: (student: Student) => ({ name }),
          //     changes: (student: Student) => ({ ...student, ...changes }),
          //   }),
          // );

          if (!customPatchMethod) {
            patchState(store, updateEntity({ id: id, changes: changes })); // TODO: Might be excessive.
          } else {
            customPatchMethod(store as unknown as InstanceType<typeof StudentStore>, id, changes);
          }
        } else {
          console.error(`Student id: ${id} not found.`);
        }
      } else {
        console.error('Unable to update non-existent student');
      }
    },
    // updateStudentWithBackgroundWorker(id: PersonId | null, changes: UpdateSpecWithoutPropModification<Student>): void {
    //   if (id) {
    //     // TODO: Check for success? (Or perform rollback?)
    //     // TODO: Notify of errors.
    //     store.updateDb(id, changes);
    //
    //     patchState(store, updateEntity({ id: id, changes: changes }));
    //   }
    // },
    async removeStudent(studentId: PersonId): Promise<void> {
      await eduUtilsDb.students.delete(studentId);
      patchState(store, removeEntity(studentId));
    },
  })),
  withBehaviorMethods(),
  withHooks((store, behaviorStore = inject(ObservationBehaviorStore)) => ({
    onInit(): void {
      // const result = behaviorStore.autoLoadEntities();
      // TODO: This should really be in the behavior store, and not here to re-populate the behavior store.
      // const rxMethodRef = behaviorStore.autoLoadEntities2(from(liveQuery(() => eduUtilsDb.observationBehaviors.toArray())));

      // TODO: Although, really we should just be listening for db changes and updating with that instead.
      //  As the students table is being updated there. We should be listening for the liveQuery and updating students when that comes through.
      //  Although we need to consider the performance implications.
      effect(() => {
        const behaviorSet: Set<EntityId> = new Set<EntityId>(behaviorStore.ids());

        patchState(store, updateEntities({
          // TODO: This predicate may not work in all circumstances! It needs to be tested.
          //  Maybe intersection instead to see if the intersection size is the same as the student's behavior set size?
          predicate: ({ behaviors }) => behaviors?.length > 0 && new Set(behaviors).difference(behaviorSet).size > 0,
          // predicate: ({ behaviors }) => true,
          // changes: (student) => ({ behaviors: Array.from(behaviorSet.intersection(new Set(student.behaviors))) }),
          changes: (student) => {
            const updatedBehaviors = Array.from(behaviorSet.intersection(new Set(student.behaviors)));
            // console.log('patching changes from effect', 'studentId', student.id, 'currentBehaviors', student.behaviors, 'updatedBehaviors', updatedBehaviors);
            return { behaviors: updatedBehaviors };
          },
        }));
      });
    },
  })),
);

function withBehaviorMethods() {
  return signalStoreFeature(
    withMethods((store) => ({
      async addBehavior(studentId: PersonId, behaviorId: BehaviorId): Promise<void> {
        // TODO: Add try catch
        const entriesUpdated: number = await eduUtilsDb.students.where({ id: studentId }).modify((val, ctx) => {
          if (!Array.isArray(val.behaviors)) {
            val.behaviors = [];
          }

          if (!val.testBehaviors) {
            val.testBehaviors = new Set<BehaviorId>();
          }

          if (!val.behaviors.includes(behaviorId)) {
            val.behaviors.push(behaviorId);
          }

          val.testBehaviors.add(behaviorId); // TODO: See how this propagates changes and if things show as updated whether or not this was added.
        });

        if (entriesUpdated === 1) {
          patchState(store, updateEntity<Student>({
            id: studentId,
            changes: (student) => {
              const newBehaviors = new Set(student.behaviors);
              newBehaviors.add(behaviorId);
              student.testBehaviors.add(behaviorId);

              return {
                behaviors: [...newBehaviors],
                testBehaviors: new Set(student.testBehaviors),
              };
            },
          }));
        } else {
          console.error('Unable to modify the behaviors of the student, or the student already has the behavior.');
        }
      },
      async removeBehavior(studentId: PersonId, behaviorId: BehaviorId): Promise<void> {
        const entriesUpdated: number = await eduUtilsDb.students.where({ id: studentId }).modify((val, ctx) => {
          const index = val.behaviors.indexOf(behaviorId);

          if (index > -1) {
            val.behaviors.splice(index, 1);
            // return true;
          } else {
            // return false; // TODO: Determine if you want to do this.
          }

          return val.testBehaviors.delete(behaviorId);
        });

        if (entriesUpdated === 1) {
          patchState(store, updateEntity<Student>({
            id: studentId,
            changes: (student) => {
              const newBehaviors = new Set(student.behaviors);
              newBehaviors.delete(behaviorId);
              student.testBehaviors.delete(behaviorId);

              return {
                behaviors: [...newBehaviors],
                testBehaviors: new Set(student.testBehaviors),
              };
            },
          }));
        } else {
          console.error('Unable to remove the behavior of the student.');
        }
      },
    })),
  );
}
