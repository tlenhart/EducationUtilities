import Dexie, { Table } from 'dexie';
import { DbNote, DbNoteChanges, NoteId } from '../scheduler-base/models/notes.model';

export class NotesDb extends Dexie {
  public readonly notes!: Table<DbNote, NoteId, DbNoteChanges>;
  public readonly noteDumpster!: Table<DbNote, NoteId, DbNoteChanges>;

  constructor() {
    super('NotesDb');

    this.version(1).stores({
      notes: '++id',
    });

    // Add dumpster/trash.
    this.version(2).stores({
      noteDumpster: 'id',
    });
  }

  public async moveToTrash(noteId: NoteId): Promise<void> {
    await notesDb.transaction('rw', [notesDb.notes, notesDb.noteDumpster], async () => {
      const noteToMove = await notesDb.notes.get(noteId);

      if (!noteToMove) {
        Dexie.currentTransaction.abort();
        return;
      }

      // Move to dumpster.
      const noteAddedId: number = await notesDb.noteDumpster.add(noteToMove);

      if (noteAddedId !== noteId) {
        Dexie.currentTransaction.abort();
        return;
      }

      await notesDb.notes.delete(noteId);
    });
  }

  public async restoreNote(noteId: NoteId): Promise<void> {
    await notesDb.transaction('rw', [notesDb.notes, notesDb.noteDumpster], async () => {
      const noteToMove = await notesDb.noteDumpster.get(noteId);

      if (!noteToMove) {
        Dexie.currentTransaction.abort();
        return;
      }

      // Move to main notes table.
      const noteMovedId: number = await notesDb.notes.add(noteToMove);

      if (noteMovedId !== noteId) {
        Dexie.currentTransaction.abort();
        return;
      }

      await notesDb.noteDumpster.delete(noteId);
    });
  }

  public async emptyTrash(): Promise<void> {
    await notesDb.noteDumpster.clear();
  }
}

export const notesDb = new NotesDb();
