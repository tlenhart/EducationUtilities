import Dexie, { DexieOptions, Table } from 'dexie';
import { exportDB } from 'dexie-export-import';
import { Temporal } from 'temporal-polyfill';
import { dbVersions } from '../../models/app-version.model';
import { Exportable } from '../../models/exportable.model';
import {
  BehaviorId,
  DbObservationBehavior,
  DbObservationBehaviorChanges,
  DbObservationEntry,
  DbObservationEntryChanges,
  DbObservationSession,
  DbObservationSessionChanges,
} from '../../models/observation.model';
import { DbAid, DbAidChanges } from '../../scheduler-base/models/aid.model';
import { PersonId } from '../../scheduler-base/models/person-type.model';
import { DbSchedule, DbScheduleChanges } from '../../scheduler-base/models/schedule.model';
import { DbStudent, DbStudentChanges } from '../../scheduler-base/models/student.model';
import { DbTeacher, DbTeacherChanges } from '../../scheduler-base/models/teacher.model';
import { filterTablesWithSets } from '../../utils/db.utils';

export class EduUtilsDb extends Dexie implements Exportable {
  // TODO: ! https://dexie.org/docs/ExportImport/dexie-export-import
  // public readonly people!: Table<Person, number, DbPerson>;
  public readonly teachers!: Table<DbTeacher, PersonId, DbTeacherChanges>;
  public readonly aids!: Table<DbAid, PersonId, DbAidChanges>;
  public readonly students!: Table<DbStudent, PersonId, DbStudentChanges>;
  public readonly observationBehaviors!: Table<DbObservationBehavior, BehaviorId, DbObservationBehaviorChanges>;
  public readonly observationSessions!: Table<DbObservationSession, number, DbObservationSessionChanges>;
  public readonly observationEntries!: Table<DbObservationEntry, number, DbObservationEntryChanges>;
  // public readonly schedules!: Table<DbSchedule, number, DbScheduleChanges>;
  // public readonly userScheduleData: Table<{ userId: number, scheduleId: number, scheduleData: { } }, number, ...>;

  constructor() {
    super('EduUtilsDb', {
      cache: 'immutable', // TODO: Try this.
    } as DexieOptions);

    this.version(dbVersions.eduUtils['one']).stores({
      // schedules: '++id',
      // groups: '++id, scheduleId',
      // people: '++id, type',
      teachers: '++id, scheduleId',
      aids: '++id, scheduleId',
      students: '++id, *behaviors',
      observationBehaviors: '++id',
      observationSessions: '++id, personId, *behaviorIds', // See: https://dexie.org/docs/MultiEntry-Index
      observationEntries: '++id, observationSessionId, behaviorId', // TODO: Consider removing the behaviorId from this or observationSessions.
    });

    this.version(dbVersions.eduUtils['two']).stores({
      observationBehaviors: '++id, &behavior',
    });

    this.version(dbVersions.eduUtils['three']).stores({
      observationEntries: '++id, observationSessionId, behaviorId, [observationSessionId+behaviorId]',
    });

    // TODO?: Return new liveQuery instances that take where clauses to generate dynamic queries.

    // this.on('versionchange', async (event) => {
    //   event.
    // });

    // TODO: Get rid of this.
    this.on('ready', async () => {
      const existingBehaviorIds = await eduUtilsDb.observationBehaviors.toCollection().primaryKeys();

      await eduUtilsDb.students.toCollection().modify((dbStudent) => {
        if (!dbStudent.behaviors) {
          dbStudent.behaviors = [];
        }

        if (!dbStudent.testBehaviors) {
          dbStudent.testBehaviors = new Set();

          if (dbStudent.behaviors) {
            dbStudent.testBehaviors = dbStudent.testBehaviors.union(new Set(dbStudent.behaviors));
          }
        }

        // dbStudent.behaviors = [];
        // dbStudent.testBehaviors = new Set<BehaviorId>();

        // for (const entry of existingBehaviorIds) {
        //   if (dbStudent.testBehaviors.has(entry)) {
        //     dbStudent.testBehaviors.delete(entry);
        //   }
        //
        //   const index = dbStudent.behaviors.indexOf(entry);
        //
        //   if (index > -1) {
        //     dbStudent.behaviors.splice(index, 1);
        //   }
        // }
      });

      await eduUtilsDb.observationSessions.toCollection().modify((observationSession: DbObservationSession) => {
        if (!observationSession.createdDate) {
          observationSession.createdDate = Temporal.Now.zonedDateTimeISO().toString();
        }
      });

      // const uniqueBehaviors = new Set<string>();
      // const behaviorIdsToDelete = new Set<BehaviorId>();
      // await eduUtilsDb.observationBehaviors.each((behavior: DbObservationBehavior) => {
      //   const behaviorName = behavior.behavior.toLocaleLowerCase();
      //   if (uniqueBehaviors.has(behaviorName)) {
      //     behaviorIdsToDelete.add(behavior.id);
      //   }
      //
      //   uniqueBehaviors.add(behaviorName);
      // });
      //
      // const result2 = await eduUtilsDb.observationBehaviors.where('id').anyOf(Array.from(behaviorIdsToDelete)).delete();
      // console.log('deleted', result2);
      //
      // const modified = await eduUtilsDb.students.toCollection().modify((student: DbStudent) => {
      //   for (const entry of behaviorIdsToDelete) {
      //     const testBehaviorDeleted = student.testBehaviors.delete(entry);
      //
      //     let entryDeleted: boolean = false;
      //     const entryIndex = student.behaviors?.indexOf(entry) ?? -1;
      //     if (entryIndex > -1) {
      //       student.behaviors.splice(entryIndex, 1);
      //       entryDeleted = true;
      //     }
      //   }
      //
      //   // return testBehaviorDeleted || entryDeleted;
      // });
    });

    this.on('populate', () => this.populate());
  }

  public async exportDb(tableNames?: Array<string> | 'full'): Promise<boolean> {
    // TODO: Use Dexie export-import. (Data still needs to be masked however.)
    // TODO: Move to worker.
    const exportResult = await exportDB(eduUtilsDb, {
      skipTables: filterTablesWithSets(eduUtilsDb.tables, tableNames, 'exclude'),
      prettyJson: true,
      // transform: ... (See below and map it appropriately.)
    });

    console.log(await exportResult.text());

    return true;

    // let result: boolean = false;
    // const incrementor = getIncrementor();
    // try {
    //   const exportData: Record<string, unknown> = {};
    //   // const settings = await this.settings.toArray();
    //
    //   const filteredTables: Array<Table> = filterTables(this.tables, tableNames);
    //   for (const table of filteredTables) {
    //     const tableContents = await table.toArray();
    //
    //     // for (let i = 0; i < tableContents.length; i++) {
    //     for (const entry of tableContents) {
    //       // TODO: Add additional properties.
    //       maskProperty('name', table.name, entry, incrementor);
    //       maskProperty('Name', table.name, entry, incrementor);
    //     }
    //
    //     exportData[table.name] = tableContents;
    //   }
    //
    //   console.error(JSON.stringify(exportData));
    //
    //   result = true;
    // } catch (e: unknown) {
    //   console.error('Error exporting settings db.', e);
    // }
    //
    // // incrementor.next('end');
    // // TODO: Test.
    // // @ts-expect-error
    // incrementor.return();
    // return result;
  }

  private async populate(): Promise<void> {
    await eduUtilsDb.students.add({
      name: 'Leto',
      behaviors: [],
      testBehaviors: new Set<BehaviorId>(),
    });

    await eduUtilsDb.observationBehaviors.add({
      behavior: 'Chaos Initializer',
      color: '#157ecf',
    });
  }
}

export const eduUtilsDb = new EduUtilsDb();
