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
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { DbErrors, DexieResult } from '../../../../models/dexie-result.model';
import { FormGroupOf } from '../../../../models/forms.types';
import { BehaviorId, ObservationBehavior } from '../../../../models/observation.model';
import { InsertDbType } from '../../../../scheduler-base/models/db.types';
import { ButtonWithIconComponent } from '../../../../shared/button-with-icon/button-with-icon.component';
import { ObservationBehaviorStore } from '../../../../shared/stores/observation-behavior.store';
import { ColorValues } from '../../../../utils/color.utils';
import {
  ObservationBehaviorConfigurationFormComponent,
} from '../observation-behavior-configuration-form/observation-behavior-configuration-form.component';

@Component({
  selector: 'eu-add-observation-behavior-dialog',
  imports: [
    ButtonWithIconComponent,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatProgressSpinner,
    ReactiveFormsModule,
    ObservationBehaviorConfigurationFormComponent,
  ],
  templateUrl: './add-observation-behavior-dialog.component.html',
  styleUrl: './add-observation-behavior-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddObservationBehaviorDialogComponent implements OnDestroy {
  public readonly observationBehaviorStore = inject(ObservationBehaviorStore);
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly dialogRef: MatDialogRef<AddObservationBehaviorDialogComponent, BehaviorId> = inject<MatDialogRef<AddObservationBehaviorDialogComponent, BehaviorId>>(MatDialogRef<AddObservationBehaviorDialogComponent, BehaviorId>);

  public readonly submitting: WritableSignal<boolean> = signal(false);
  public readonly maxBehaviorLength: Signal<number> = signal(515);

  public readonly addObservationBehaviorForm: FormGroup<FormGroupOf<InsertDbType<ObservationBehavior>>>;
  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    this.addObservationBehaviorForm = this.fb.group<FormGroupOf<InsertDbType<ObservationBehavior>>>({
      /* eslint-disable @typescript-eslint/unbound-method */
      behavior: this.fb.control<string>('', [Validators.required, Validators.maxLength(this.maxBehaviorLength())]),
      color: this.fb.control<ColorValues>('#635789'), // '#123456'
      description: this.fb.control<string>({ value: '', disabled: false }),
      /* eslint-enable @typescript-eslint/unbound-method */
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public async addObservationBehavior(): Promise<void> {
    this.submitting.set(true);
    this.addObservationBehaviorForm.disable();
    this.dialogRef.disableClose = true;

    // TODO: Add error handling.
    const result: DexieResult<BehaviorId> = await this.observationBehaviorStore.addObservationBehavior(this.addObservationBehaviorForm.getRawValue() as InsertDbType<ObservationBehavior>);

    this.submitting.set(false);
    this.addObservationBehaviorForm.enable();
    this.dialogRef.disableClose = false;

    if (!result.error) {
      this.dialogRef.close(result.result);
    } else {
      if (result.error.name === DbErrors.Constraint) {
        this.addObservationBehaviorForm.controls.behavior.setErrors({ duplicate: true });
      } else {
        // TODO: Add other conditions or a default here.
      }
    }

  }
}
