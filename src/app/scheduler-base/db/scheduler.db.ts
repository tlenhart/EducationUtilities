import Dexie, { Table } from 'dexie';
import { Exportable, maskProperty } from '../../models/exportable.model';

import { getIncrementor } from '../../utils/number-utils';
import { DbAid, DbAidChanges } from '../models/aid.model';
import { ScheduleGroup } from '../models/schedule-group.model';
import { DbScheduleChanges, Schedule } from '../models/schedule.model';
import { Student } from '../models/student.model';
import { DbTeacher, DbTeacherChanges, Teacher } from '../models/teacher.model';
import { filterTables } from '../../utils/db.utils';

export class SchedulerDb extends Dexie implements Exportable {
  public schedules!: Table<Schedule, number, DbScheduleChanges>;
  public groups!: Table<ScheduleGroup, number>;
  public teachers!: Table<DbTeacher, number, DbTeacherChanges>;
  public aids!: Table<DbAid, number, DbAidChanges>;
  public students!: Table<Student, number>;

  constructor() {
    super('Scheduler');
    this.version(4).stores({
      schedules: '++id',
      groups: '++id, scheduleId',
      teachers: '++id, scheduleId',
      aids: '++id, scheduleId',
      students: '++id, scheduleId',
    });

    this.on('populate', () => this.populate());
  }
  public async export(tableNames?: Array<string> | 'full'): Promise<boolean> {
    let result: boolean = false;
    const incrementor = getIncrementor();
    try {
      const exportData: Record<string, unknown> = {};
      // const settings = await this.settings.toArray();

      const filteredTables: Array<Table> = filterTables(this.tables, tableNames);
      for (const table of filteredTables) {
        const tableContents = await table.toArray();

        // for (let i = 0; i < tableContents.length; i++) {
        for (const entry of tableContents) {
          // TODO: Add additional properties.
          maskProperty('name', table.name, entry, incrementor);
          maskProperty('Name', table.name, entry, incrementor);
        }

        exportData[table.name] = tableContents;
      }

      console.error(JSON.stringify(exportData));

      result = true;
    } catch (e: unknown) {
      console.error('Error exporting settings db.', e);
    }

    // incrementor.next('end');
    // TODO: Test.
    // @ts-expect-error
    incrementor.return();
    return result;
  }

  private async populate(): Promise<void> {
    const scheduleId: number = await schedulerDb.schedules.add({
      title: 'Default Schedule',
    } as Schedule);

    await schedulerDb.teachers.bulkAdd([
      {
        scheduleId: scheduleId,
        name: 'Mr. Anderson',
        schedule: [],
        room: 'Computers',
      },
      {
        scheduleId: scheduleId,
        name: 'Mr. Bueller',
        schedule: [],
        room: 'GenPop',
      },
      {
        scheduleId: scheduleId,
        name: 'Mr. Lorensax',
        schedule: [],
        room: 'Econ 101',
      },
    ]);

    await schedulerDb.aids.bulkAdd([
      {
        scheduleId: scheduleId,
        name: 'Jeff',
        schedule: [],
      },
      {
        scheduleId: scheduleId,
        name: 'Jeff 2',
        schedule: [],
      },
      {
        scheduleId: scheduleId,
        name: 'Mark',
        schedule: [],
      },
    ]);

    await schedulerDb.students.bulkAdd([
      {
        scheduleId: scheduleId,
        name: 'Student Name',
        minutes: [],
      } as unknown as Student,
    ]);
  }

}

export const schedulerDb = new SchedulerDb();
