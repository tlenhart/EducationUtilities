import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  InputSignalWithTransform,
  OnDestroy,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, from, map, Observable, Subscription, throwError } from 'rxjs';
import { IdImportType } from '../../../models/route-parameter.model';
import { PersonId } from '../../../scheduler-base/models/person-type.model';
import { StudentStore } from '../../../shared/stores/student.store';
import {
  StudentBehaviorConfigurationComponent,
} from '../student-behavior-configuration/student-behavior-configuration.component';

@Component({
  selector: 'eu-edit-student',
  imports: [
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    StudentBehaviorConfigurationComponent,
    JsonPipe,
  ],
  templateUrl: './edit-student.component.html',
  styleUrl: './edit-student.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditStudentComponent implements OnDestroy {
  public studentId: InputSignalWithTransform<number, IdImportType> = input.required<number, IdImportType>({
    transform: (value: IdImportType) => {
      if (typeof value !== 'number') {
        value = parseInt(value, 10);
      }

      if (isNaN(value)) {
        value = -1;
      }

      return value;
    },
  });

  public readonly nameFormControl: FormControl<string>;

  public readonly showBehaviorConfiguration: Signal<boolean | undefined>;

  private readonly showBehaviorConfiguration$: Observable<boolean>;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly updateNameSubscription: Subscription | null = null;

  public readonly studentStore = inject(StudentStore);
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  constructor() {
    this.showBehaviorConfiguration$ = this.activatedRoute.queryParamMap.pipe(
      map((params) => {
        const showBehaviorConfig = params.get('showBehaviorConfiguration');

        if (showBehaviorConfig) {
          return coerceBooleanProperty(showBehaviorConfig);
        }

        return false;
      }),
    );

    this.showBehaviorConfiguration = toSignal(this.showBehaviorConfiguration$);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.nameFormControl = this.fb.control(this.studentStore.configurationEntity()?.name ?? '', [Validators.required]);

    effect(() => {
      const entity = this.studentStore.configurationEntity();
      console.log('changing student, entity, route id', entity?.id, this.studentId());
      if (entity?.id === this.studentId()) {
        this.nameFormControl.setValue(entity?.name ?? '');

        // TODO: !! Is this a good idea, or should we approach it like the edit-teacher page?
        // this.updateNameSubscription?.unsubscribe();
      }
    });

    this.updateNameSubscription = this.nameFormControl.valueChanges.pipe(
      debounceTime(200),
      filter((): boolean => this.nameFormControl.valid), // Only update when the form control is valid.
      distinctUntilChanged(),
      map((newName: string) => {
        const id = this.studentStore.configurationEntityId();

        if (id === this.studentId() && this.studentStore.configurationEntity()?.name !== newName) {
          console.log(`Updating the student's name in the database.`);
          return from(this.updateName(id, newName));
        } else {
          return throwError(() => new Error('Student ids do not match, or the name has not changed.'));
        }
      }),
    ).subscribe({
      next: () => {
        // TODO: This is called even if the user is not updated.
        // this.logService.createLog('info', 'Student name update success.', undefined, true);
        // console.log('student name updated');
      },
      error: (error: Error) => {
        // this.logService.createLog('error', `Student name update failure in db.`, error, true);
        console.error('Error while updating student name in db.', error);
      },
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.updateNameSubscription?.unsubscribe();
  }

  private async updateName(id: PersonId, newName: string): Promise<void> {
    await this.studentStore.updateStudent(id, { name: newName });

    // TODO: Use this instead?
    // this.studentStore.updateDb<Student>(id, { name: newName });
  }
}
