import { Temporal } from 'temporal-polyfill';
import { UpdateSpecWithoutPropModification } from '../../models/db-event-type.model';
import { DbBase, UpdateDbChanges } from './db.types';
import { DbEntryWithZonedTemporalType } from './schedule-time.model';

export type NoteId = number;

export interface Note extends DbBase {
  content: string;
  timestamp: Temporal.ZonedDateTime;
}

export type DbNote = DbEntryWithZonedTemporalType<Note>;
export type DbNoteChanges = UpdateDbChanges<DbNote>;

export function convertToDbNote(note: UpdateSpecWithoutPropModification<Note>): UpdateSpecWithoutPropModification<DbNote> {
  return {
    ...note,
    timestamp: note.timestamp?.toString(),
  };
}

export function toDisplayNote(dbNote: DbNote): DbNote {
  return {
    ...dbNote,
    timestamp: Temporal.ZonedDateTime.from(dbNote.timestamp).toLocaleString(),
  };
}

export function createExportNote(timestamp: string, content: string): string {
  return `[${timestamp}]\n${content}\n`;
}
