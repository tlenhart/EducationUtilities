import Dexie, { Table } from 'dexie';
import { Exportable } from '../models/exportable.model';
import { NewGlobalSettings } from './settings.model';
import { globalUserSettingsDefaults } from './settings.store';
import { filterTables } from '../utils/db.utils';

let count = 0;

export class SettingsDb extends Dexie implements Exportable {
  public readonly settings!: Table<NewGlobalSettings, 'user' | 'default'>;

  constructor() {
    super('SettingsDb');

    this.version(1).stores({
      settings: 'name',
    });

    this.on('populate', () => this.populate());

    this.on('close', () => {
      --count;

      console.log('close count', count);
    });
    this.on('ready', () => {
      ++count;

      console.log('ready count', count);
    });
  }

  public async exportDb(tableNames?: Array<string> | 'full'): Promise<boolean> {
    try {
      const exportData: Record<string, unknown> = {};
      // const settings = await this.settings.toArray();

      const filteredTables: Array<Table> = filterTables(this.tables, tableNames);
      for (const table of filteredTables) {
        const tableContents = await table.toArray();
        exportData[table.name] = tableContents;
      }

      console.log(JSON.stringify(exportData));

      return true;
    } catch (e: unknown) {
      console.error('Error exporting settings db.', e);

      return false;
    }
  }

  private async populate(): Promise<void> {
    await settingsDb.settings.bulkAdd([
      {
        ...globalUserSettingsDefaults,
        name: 'default',
      },
      {
        ...globalUserSettingsDefaults,
        name: 'user',
      },
    ], {
      allKeys: true,
    });
  }
}

export const settingsDb = new SettingsDb();
