import Dexie, { Table } from 'dexie';
import { DbNote, DbNoteChanges, NoteId } from '../scheduler-base/models/notes.model';

export class NotesDb extends Dexie {
  public readonly notes!: Table<DbNote, NoteId, DbNoteChanges>;

  constructor() {
    super('NotesDb');

    this.version(1).stores({
      notes: '++id',
    });
  }
}

export const notesDb = new NotesDb();
