import { ChangeDetectionStrategy, Component, inject, OnDestroy, Signal, signal, WritableSignal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { FormGroupOf } from '../../../models/forms.types';
import { BehaviorId } from '../../../models/observation.model';
import { InsertDbType } from '../../../scheduler-base/models/db.types';
import { AvailabilitySchedule, PersonId } from '../../../scheduler-base/models/person-type.model';
import { Minutes, Student } from '../../../scheduler-base/models/student.model';
import { ButtonWithIconComponent } from '../../../shared/button-with-icon/button-with-icon.component';
import { StudentStore } from '../../../shared/stores/student.store';

@Component({
  selector: 'eu-add-student-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatProgressSpinner,
    ReactiveFormsModule,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ButtonWithIconComponent,
  ],
  templateUrl: './add-student-dialog.component.html',
  styleUrl: './add-student-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStudentDialogComponent implements OnDestroy {
  public readonly studentStore = inject(StudentStore);
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef: MatDialogRef<AddStudentDialogComponent, PersonId> = inject<MatDialogRef<AddStudentDialogComponent, PersonId>>(MatDialogRef<AddStudentDialogComponent, PersonId>);

  public readonly submitting: WritableSignal<boolean> = signal(false);
  public readonly maxNameLength: Signal<number> = signal(200);

  public readonly addStudentForm: FormGroup<FormGroupOf<InsertDbType<Student>>>;
  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    this.addStudentForm = this.fb.group({
      /* eslint-disable @typescript-eslint/unbound-method */
      name: this.fb.control('', [Validators.required, Validators.maxLength(this.maxNameLength())]),
      behaviors: this.fb.control<Array<BehaviorId>>([]),
      minutes: this.fb.control<Array<Minutes>>([]),
      testBehaviors: this.fb.control(new Set<BehaviorId>()),
      schedule: this.fb.control<AvailabilitySchedule>([]),
      /* eslint-enable @typescript-eslint/unbound-method */
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public async submitForm(): Promise<void> {
    // This is for when a user hits 'enter' rather than clicking on the Add Student button.
    if (this.addStudentForm.valid) {
      await this.addStudent();
    }
  }

  public async addStudent(): Promise<void> {
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.addStudentForm.disable();
    this.dialogRef.disableClose = true;

    // TODO: Add error handling.
    const id: PersonId = await this.studentStore.addStudent(this.addStudentForm.getRawValue() as InsertDbType<Student>);

    this.submitting.set(false);
    this.addStudentForm.enable();
    this.dialogRef.disableClose = false;

    this.dialogRef.close(id);
  }
}
