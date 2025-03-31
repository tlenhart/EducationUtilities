import { Temporal } from 'temporal-polyfill';
import { DbBase, InsertDbType, UpdateDbChanges } from '../scheduler-base/models/db.types';
import { PersonId } from '../scheduler-base/models/person-type.model';
import { DbEntryWithZonedTemporalType } from '../scheduler-base/models/schedule-time.model';
import { ColorValues } from '../utils/color.utils';
import { toTemporalZonedDateTime } from '../utils/time.utils';
import { UpdateSpecWithoutPropModification } from './db-event-type.model';
import { TimeInterval } from './time.model';

export type BehaviorId = number;
export type ObservationSessionId = number;
export type ObservationEntryId = number;

export interface ObservationBehavior extends DbBase<BehaviorId> {
  behavior: string;
  description?: string;
  color?: ColorValues;
}

export interface ObservationEntry extends DbBase<ObservationEntryId> {
  // References to external data sources.
  observationSessionId: ObservationSessionId;
  behaviorId: BehaviorId;

  timestamp: Temporal.ZonedDateTime;
  notes?: string;

  isComparisonStudent: boolean;
}

export interface ObservationSession extends DbBase<ObservationSessionId> {
  // References to external data sources.
  personId: PersonId;

  createdDate: Temporal.ZonedDateTime;
  startTime: Temporal.ZonedDateTime | undefined;
  endTime: Temporal.ZonedDateTime | undefined;
  definedInitialSessionLength: TimeInterval | undefined;

  notes: string | undefined;
  comparisonStudentNotes: string | undefined;

  showComparisonStudent: boolean | undefined;
}

export interface ObservationSessionWithEntries {
  session: ObservationSession;
  entries: Array<ObservationEntry>;
  comparisonStudentEntries: Array<ObservationEntry>;
}

export interface ObservationSessionMetrics {
  primaryStudent: ObservationMetrics;
  comparisonStudent: ObservationMetrics;
}

export interface ObservationMetrics {
  count: number;
  data: string,
  behaviorMetrics: Record<BehaviorId, number>,
}

export type CreateObservationSessionResult = {
  success: false;
} | {
  success: true;
  sessionId: ObservationSessionId;
  studentId: PersonId;
};

export type DbObservationBehavior = ObservationBehavior;
export type DbObservationBehaviorChanges = UpdateDbChanges<ObservationBehavior>;

export type DbObservationSession = DbEntryWithZonedTemporalType<ObservationSession>;
export type DbObservationSessionChanges = UpdateDbChanges<DbEntryWithZonedTemporalType<ObservationSession>>;

export type DbObservationEntry = DbEntryWithZonedTemporalType<ObservationEntry>;
export type DbObservationEntryChanges = UpdateDbChanges<DbEntryWithZonedTemporalType<ObservationEntry>>;

export function toObservationEntry(entry: DbObservationEntry): ObservationEntry{
  return {
    ...entry,
    timestamp: toTemporalZonedDateTime(entry.timestamp),
  };
}

export function toObservationEntries(entries: Array<DbObservationEntry>): Array<ObservationEntry> {
  return entries.map(toObservationEntry);
}

export function toDbObservationSession(session: ObservationSession): DbObservationSessionChanges {
  const dbSession: DbObservationSessionChanges = {
    ...session,
    createdDate: session.createdDate.toString(),
    startTime: session.startTime?.toString(),
    endTime: session.endTime?.toString(),
    notes: session.notes,
    comparisonStudentNotes: session.comparisonStudentNotes,
  } satisfies DbObservationSessionChanges;

  return dbSession;
}

export function toInsertDbObservationSession(session: InsertDbType<ObservationSession>): DbObservationSessionChanges {
  return {
    ...session,
    createdDate: session.createdDate.toString(),
    startTime: session.startTime?.toString(),
    endTime: session.endTime?.toString(),
  };
}

export function fromDbObservationSession(dbSession: DbObservationSession): ObservationSession {
  return {
    ...dbSession,
    createdDate: toTemporalZonedDateTime(dbSession.createdDate),
    startTime: dbSession.startTime ? toTemporalZonedDateTime(dbSession.startTime) : undefined,
    endTime: dbSession.endTime ? toTemporalZonedDateTime(dbSession.endTime) : undefined,
  };
}

export function toInsertDbObservationBehavior(behavior: InsertDbType<ObservationBehavior>): InsertDbType<ObservationBehavior> {
  return {
    ...behavior,
    behavior: behavior.behavior.trim(),
  } as InsertDbType<ObservationBehavior>;
}

export function toDbObservationBehavior(id: BehaviorId, behavior: UpdateSpecWithoutPropModification<ObservationBehavior>): UpdateSpecWithoutPropModification<DbObservationBehavior> {
  const dbObservationBehavior: UpdateSpecWithoutPropModification<ObservationBehavior> = {
    ...behavior,
    id: id,
  };

  if (Object.hasOwn(dbObservationBehavior, 'behavior' satisfies keyof ObservationBehavior)) {
    dbObservationBehavior.behavior = dbObservationBehavior.behavior?.trim();
  }

  return dbObservationBehavior;
}

export function fromDbObservationBehavior(observationBehavior: DbObservationBehavior): ObservationBehavior {
  return {
    ...observationBehavior,
  };
}

export function fromDbObservationBehaviors(observationBehaviors: Array<DbObservationBehavior>): Array<ObservationBehavior> {
  return observationBehaviors.map(fromDbObservationBehavior);
}

export function toInsertDbObservationEntry(observationEntry: InsertDbType<ObservationEntry>): DbObservationEntryChanges {
  return {
    ...observationEntry,
    timestamp: observationEntry.timestamp.toString(),
  };
}
