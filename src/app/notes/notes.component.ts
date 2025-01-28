import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { liveQuery } from 'dexie';
import { from, map } from 'rxjs';
import { Temporal } from 'temporal-polyfill';
import { UpdateSpecWithoutPropModification } from '../models/db-event-type.model';
import { convertToDbNote, DbNote, Note, toDisplayNote } from '../scheduler-base/models/notes.model';
import { DbEntryWithZonedTemporalType } from '../scheduler-base/models/schedule-time.model';
import { notesDb } from './notes.db';

@Component({
  selector: 'eu-notes',
  imports: [
    MatButton,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatRow,
    MatHeaderRow,
    MatRowDef,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatTooltip,
    CdkCopyToClipboard,
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesComponent {

  public readonly noteControl: FormControl<string>;
  public readonly saveMessage: WritableSignal<string> = signal('');
  public readonly showNotes: WritableSignal<boolean> = signal(false);
  public readonly displayedColumns: ReadonlyArray<keyof Note | 'copyNote'> = [
    'timestamp',
    'content',
    'copyNote',
  ];
  public readonly noteTextArea: Signal<ElementRef<HTMLTextAreaElement>> = viewChild.required('noteArea');

  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  public readonly allNotes = from(
    liveQuery(() => {
      return notesDb.notes.reverse().toArray();
    }))
    .pipe(map(notes => {
      return notes.map(toDisplayNote);
    }));

  constructor() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.noteControl = this.fb.control('', [Validators.required]);
  }

  public async addNote(): Promise<void> {
    const dbNote: UpdateSpecWithoutPropModification<DbNote> = convertToDbNote({
      content: this.noteControl.value,
      timestamp: Temporal.Now.zonedDateTimeISO(),
    });

    const addResult = await notesDb.notes.add(dbNote);

    if (addResult > 0) {
      this.saveMessage.set('Note saved successfully.');
      this.noteControl.setValue('');
    } else {
      this.saveMessage.set('Error while saving note.');
    }

    this.noteTextArea().nativeElement.focus();
  }

  public showHideNotes(): void {
    this.showNotes.set(!this.showNotes());
  }

  public copyNoteWithTimestamp(displayNote: DbNote): string {
    return this.createExportNote(displayNote.timestamp, displayNote.content);
  }

  public async exportNotes(): Promise<void> {
    const allNotes = await notesDb.notes.toArray();

    const result: string = allNotes.map((note: DbEntryWithZonedTemporalType<DbNote>) => {
      const timestamp = Temporal.ZonedDateTime.from(note.timestamp).toLocaleString();
      return this.createExportNote(timestamp, note.content);
      // return `${timestamp}\n${note.content}\n`;
    }).join('\n');

    const file: Blob = new Blob([result], { type: 'text/plain;charset=utf-8' });

    const downloadElement = document.createElement('a');
    downloadElement.href = window.URL.createObjectURL(file);
    downloadElement.download = 'notes.txt';

    document.body.appendChild(downloadElement);

    downloadElement.click();

    document.body.removeChild(downloadElement);

    window.URL.revokeObjectURL(downloadElement.href);
  }

  private createExportNote(timestamp: string, content: string): string {
    return `[${timestamp}]\n${content}\n`;
  }
}
