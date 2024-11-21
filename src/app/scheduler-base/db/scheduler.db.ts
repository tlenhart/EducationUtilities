import Dexie, { Table } from 'dexie';
import { Aid } from '../models/aid.model';
import { ScheduleGroup } from '../models/schedule-group.model';
import { Schedule } from '../models/schedule.model';
import { Student } from '../models/student.model';
import { Teacher } from '../models/teacher.model';

export class SchedulerDb extends Dexie {
  public schedules!: Table<Schedule, number>;
  public groups!: Table<ScheduleGroup, number>;
  public teachers!: Table<Teacher, number>;
  public aids!: Table<Aid, number>;
  public students!: Table<Student, number>;

  constructor() {
    super('Scheduler');
    this.version(2).stores({
      schedules: '++id',
      groups: '++id, scheduleId',
      teachers: '++id, scheduleId',
      aids: '++id, scheduleId',
      students: '++id, scheduleId',
    });

    this.on('populate', () => this.populate());
  }

  private async populate(): Promise<void> {
    const scheduleId: number = await schedulerDb.schedules.add({
      title: 'Default Schedule',
    } as Schedule);

    await schedulerDb.teachers.bulkAdd([
      {
        scheduleId: scheduleId,
        name: 'Mr. Anderson',
        availability: [],
        homeroom: 'Computers',
      } as unknown as Teacher,
      {
        scheduleId: scheduleId,
        name: 'Mr. Bueller',
        availability: [],
        homeroom: 'GenPop',
      } as unknown as Teacher,
      {
        scheduleId: scheduleId,
        name: 'Mr. Lorensax',
        availability: [],
        homeroom: 'Econ 101',
      } as unknown as Teacher,
    ]);

    await schedulerDb.aids.bulkAdd([
      {
        scheduleId: scheduleId,
        name: 'Jeff',
        availability: [],
        homeroom: 'GenPop',
      } as unknown as Aid,
      {
        scheduleId: scheduleId,
        name: 'Jeff 2',
        availability: [],
        homeroom: 'GenPop',
      } as unknown as Aid,
      {
        scheduleId: scheduleId,
        name: 'Mark',
        availability: [],
        homeroom: 'Shop',
      } as unknown as Aid,
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
