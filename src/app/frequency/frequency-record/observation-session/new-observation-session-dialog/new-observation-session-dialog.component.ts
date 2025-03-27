import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  ModelSignal,
  OnDestroy,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { DexieResult } from '../../../../models/dexie-result.model';
import { FormGroupOf } from '../../../../models/forms.types';
import {
  BehaviorId,
  CreateObservationSessionResult,
  ObservationSession,
  ObservationSessionId,
} from '../../../../models/observation.model';
import { TimeInterval } from '../../../../models/time.model';
import { InsertDbType } from '../../../../scheduler-base/models/db.types';
import { Student } from '../../../../scheduler-base/models/student.model';
import { ButtonWithIconComponent } from '../../../../shared/button-with-icon/button-with-icon.component';
import { EntitySelectorComponent } from '../../../../shared/entity-selector/entity-selector.component';
import { CurrentObservationSessionStore } from '../../../../shared/stores/current-observation-session.store';
import { ObservationBehaviorStore } from '../../../../shared/stores/observation-behavior.store';
import { StudentStore } from '../../../../shared/stores/student.store';
import { NewObservationSessionDialogData } from './new-observation-session-dialog-data.model';

export type NewObservationSessionFormElements = Pick<InsertDbType<ObservationSession>, 'definedInitialSessionLength'>;
export type NewObservationSessionForm = FormGroupOf<
  Required<{
    [K in keyof NewObservationSessionFormElements]: NewObservationSessionFormElements[K] extends TimeInterval | undefined
      ? number
      : NewObservationSessionFormElements[K];
  }>
>;

@Component({
  selector: 'eu-new-observation-session-dialog',
  imports: [
    EntitySelectorComponent,
    ButtonWithIconComponent,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatProgressSpinner,
    MatChipListbox,
    MatChipOption,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatError,
    MatIcon,
    MatTooltip,
    MatSuffix,
  ],
  templateUrl: './new-observation-session-dialog.component.html',
  styleUrl: './new-observation-session-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewObservationSessionDialogComponent implements OnDestroy {
  public readonly studentStore = inject(StudentStore);
  public readonly behaviorStore = inject(ObservationBehaviorStore);
  public readonly currentObservationSessionStore = inject(CurrentObservationSessionStore);

  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef: MatDialogRef<NewObservationSessionDialogComponent, CreateObservationSessionResult> = inject<MatDialogRef<NewObservationSessionDialogComponent, CreateObservationSessionResult>>(
    MatDialogRef<NewObservationSessionDialogComponent, CreateObservationSessionResult>);
  private readonly dialogData: NewObservationSessionDialogData | null = inject(MAT_DIALOG_DATA) as NewObservationSessionDialogData | null;

  public readonly newObservationSessionForm: FormGroup<NewObservationSessionForm>;
  public readonly submitting: WritableSignal<boolean> = signal(false);
  public readonly selectedStudent: ModelSignal<Student | null> = model<Student | null>(null);

  public readonly selectedStudentBehaviors: Signal<Set<BehaviorId>> = computed(() => {
    const configurationEntity = this.selectedStudent();
    return new Set(configurationEntity?.behaviors ?? []);
  });

  private readonly dataLoaded$: Subscription;

  constructor() {
    this.newObservationSessionForm = this.fb.group<NewObservationSessionForm>({
      /* eslint-disable @typescript-eslint/unbound-method */
      definedInitialSessionLength: this.fb.control(15, [Validators.required, Validators.min(0.5), Validators.max(24 * 60)]),
      // trackedBehaviorIds: this.fb.control([]),
      /* eslint-enable @typescript-eslint/unbound-method */
    });

    this.dataLoaded$ = toObservable(this.studentStore.isLoaded).subscribe((dataLoaded: boolean | null) => {
      if (dataLoaded && this.dialogData?.studentId) {
        const student = this.studentStore.entityMap()[this.dialogData.studentId];
        this.selectedStudent.set(student);

        // Only listen for this once.
        this.dataLoaded$.unsubscribe();
      }
    });
  }

  public ngOnDestroy(): void {
    this.dataLoaded$.unsubscribe();
  }

  public async createNewObservationSession(): Promise<void> {
    this.submitting.set(true);

    const result = await this.createObservationSession();

    this.submitting.set(result.success);

    if (result.success && result.sessionId && result.studentId) {
      this.dialogRef.close(result);
    }
  }

  private async createObservationSession(): Promise<CreateObservationSessionResult> {
    const errorResult: CreateObservationSessionResult = { success: false };

    const student = this.selectedStudent();
    if (!student || this.newObservationSessionForm.invalid) {
      return errorResult;
    }

    if (!this.studentStore.setPrimaryEntity(student.id)) {
      return errorResult;
    }

    // TODO: Add other parameters.
    const createResult: DexieResult<ObservationSessionId> = await this.currentObservationSessionStore.initializeObservationSession(
      student.id,
      undefined, // [behavior.id],
      `${this.newObservationSessionForm.controls.definedInitialSessionLength.value}m`,
    );

    if (!createResult.error) {
      return { success: true, sessionId: createResult.result, studentId: student.id };
    } else {
      console.error(createResult.error);
    }

    return errorResult;
  }
}
