import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import {
  convertToDbNote,
  createExportNote,
  DbNote,
  Note,
  NoteId,
  toDisplayNote,
} from '../scheduler-base/models/notes.model';
import { DbEntryWithZonedTemporalType } from '../scheduler-base/models/schedule-time.model';
import { ButtonWithIconComponent } from '../shared/button-with-icon/button-with-icon.component';
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
    ButtonWithIconComponent,
  ],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesComponent {

  public readonly saveMessage: WritableSignal<string> = signal('');
  public readonly showNotes: WritableSignal<boolean> = signal(false);
  public readonly showNoteTrash: WritableSignal<boolean> = signal<boolean>(false);
  public readonly noteTextArea: Signal<ElementRef<HTMLTextAreaElement>> = viewChild.required('noteArea');
  public readonly formContainer: Signal<ElementRef<HTMLFormElement>> = viewChild.required<ElementRef>('noteForm');

  public readonly showNoteTrashBtnMessage = computed(() => {
    const showTrash = this.showNoteTrash();

    if (showTrash) {
      return 'Close Note Trash (Show Notes)';
    } else {
      return 'Open Note Trash';
    }
  });

  public readonly displayedColumns: ReadonlyArray<keyof Note | 'copyNote' | 'actions'> = [
    'timestamp',
    'content',
    'actions',
  ];
  public readonly noteControl: FormControl<string>;
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  public readonly allNotes = from(
    liveQuery(() => {
      return notesDb.notes.reverse().toArray();
    }))
    .pipe(map(notes => {
      return notes.map(toDisplayNote);
    }));

  public readonly allNotesTrash = from(
    liveQuery(() => {
      return notesDb.noteDumpster.reverse().toArray();
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
      this.formContainer().nativeElement.reset();
      this.noteControl.reset();
    } else {
      this.saveMessage.set('Error while saving note.');
    }

    this.noteTextArea().nativeElement.focus();
  }

  public copyNoteWithTimestamp(displayNote: DbNote): string {
    return createExportNote(displayNote.timestamp, displayNote.content);
  }

  public async sendToOrRestoreFromTrash(noteId: NoteId, noteTrashShown: boolean): Promise<void> {
    if (!noteTrashShown) {
      await this.sendToTrash(noteId);
    } else {
      await this.restoreFromTrash(noteId);
    }
  }

  public async deleteForever(noteId: NoteId): Promise<void> {
    await notesDb.noteDumpster.delete(noteId);
  }

  public toggleTrash(): void {
    this.showNoteTrash.set(!this.showNoteTrash());
  }

  public showHideNotes(): void {
    this.showNotes.set(!this.showNotes());

    this.showNoteTrash.set(false);
  }

  public async exportNotes(): Promise<void> {
    const allNotes = await notesDb.notes.reverse().toArray();

    const result: string = allNotes.map((note: DbEntryWithZonedTemporalType<DbNote>) => {
      const timestamp = Temporal.ZonedDateTime.from(note.timestamp).toLocaleString();
      return createExportNote(timestamp, note.content);
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

  public tableTrackBy(index: number, item: DbNote): number {
    return item.id;
  }

  private async sendToTrash(noteId: NoteId): Promise<void> {
    await notesDb.moveToTrash(noteId);
  }

  private async restoreFromTrash(noteId: NoteId): Promise<void> {
    await notesDb.restoreNote(noteId);
  }
}
