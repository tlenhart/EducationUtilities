import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  InputSignalWithTransform,
  OnDestroy,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, EMPTY, from, map, Observable, Subscription } from 'rxjs';
import { UpdateSpecWithoutPropModification } from '../../../../models/db-event-type.model';
import { FormGroupOf } from '../../../../models/forms.types';
import { BehaviorId, ObservationBehavior } from '../../../../models/observation.model';
import { IdImportType } from '../../../../models/route-parameter.model';
import { ObservationBehaviorStore } from '../../../../shared/stores/observation-behavior.store';
import { StudentStore } from '../../../../shared/stores/student.store';
import { ColorValues } from '../../../../utils/color.utils';
import {
  ObservationBehaviorConfigurationFormComponent,
} from '../observation-behavior-configuration-form/observation-behavior-configuration-form.component';

@Component({
  selector: 'eu-observation-behavior-configuration',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ObservationBehaviorConfigurationFormComponent,
  ],
  templateUrl: './observation-behavior-configuration.component.html',
  styleUrl: './observation-behavior-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObservationBehaviorConfigurationComponent implements OnDestroy {
  public readonly observationBehaviorStore = inject(ObservationBehaviorStore);
  public readonly studentStore = inject(StudentStore);
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  // Don't bother trying to extract this to an external function, Angular doesn't like you doing that.
  public observationBehaviorId: InputSignalWithTransform<number, IdImportType> = input.required<number, IdImportType>({
    // TODO: Not updating for some reason.
    transform: (value: IdImportType) => {
      console.log('transforming', value, typeof value);
      if (typeof value !== 'number') {
        value = parseInt(value, 10);
      }

      if (isNaN(value)) {
        value = -1;
      }

      return value;
    }
  });

  public readonly observationBehaviorForm: FormGroup<FormGroupOf<Required<ObservationBehavior>>>;

  public get componentForm(): FormGroup<FormGroupOf<ObservationBehavior>> {
    return this.observationBehaviorForm as FormGroup<FormGroupOf<ObservationBehavior>>;
  };

  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    this.observationBehaviorForm = this.fb.group({
      id: this.fb.control({ value: (this.observationBehaviorStore.selectedEntityId() as BehaviorId | null) ?? -1, disabled: true }),
      // eslint-disable-next-line @typescript-eslint/unbound-method
      behavior: this.fb.control(this.observationBehaviorStore.selectedEntity()?.behavior ?? '', [Validators.required, Validators.maxLength(200), this.uniqueBehaviorNames()]),
      description: this.fb.control({ value: this.observationBehaviorStore.selectedEntity()?.description ?? '', disabled: false }, [Validators.maxLength(100)]),
      color: this.fb.control<ColorValues>(this.getColor()),
    });

    // TODO: May be unnecessary and get fired too often.
    effect(() => {
      const entity = this.observationBehaviorStore.selectedEntity();
      if (entity?.id === this.observationBehaviorId()) {
        this.observationBehaviorForm.controls.behavior.setValue(entity.behavior);
        this.observationBehaviorForm.controls.description.setValue(entity.description ?? '');
        this.observationBehaviorForm.controls.color.setValue(entity.color ?? this.getColor());
      }
    });

    this.subscriptions.add(this.observationBehaviorForm.controls.behavior.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
    ).subscribe((behaviorName: string) => {
      return this.updateBehaviorMethod(this.observationBehaviorForm.controls.behavior, { behavior: behaviorName });
    }));

    this.subscriptions.add(this.observationBehaviorForm.controls.description.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map((behaviorDescription: string) => {
        return this.updateBehaviorMethod(this.observationBehaviorForm.controls.description, { description: behaviorDescription });
      })
    ).subscribe());

    this.subscriptions.add(this.observationBehaviorForm.controls.color.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((color: ColorValues | null) => {
        if (!color) {
          color = '#123456';
        }

        return this.updateBehaviorMethod(this.observationBehaviorForm.controls.color, { color: color });
      }),
    ).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateBehaviorMethod(formControl: FormControl, changes: UpdateSpecWithoutPropModification<ObservationBehavior>): Observable<void> {
    const id: BehaviorId | null = this.observationBehaviorStore.selectedEntityId() as BehaviorId | null;
    if (id && formControl.valid) {
      return from(this.updateBehavior(id, changes));
    }

    return EMPTY;
  }

  private async updateBehavior(id: BehaviorId, changes: UpdateSpecWithoutPropModification<ObservationBehavior>): Promise<void> {
    await this.observationBehaviorStore.updateObservationBehavior(id, changes);
  }

  private getColor(): ColorValues {
    const defaultColorMatches = window.getComputedStyle(document.body).getPropertyValue('--mat-sys-primary').match(/(#[\dA-F]{3,8})/gmi);
    let color: ColorValues = (defaultColorMatches?.[0] as ColorValues | null) ?? '#123456';

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      color = (defaultColorMatches?.[1] as ColorValues | null) ?? color;
    }

    return color;
  }

  private uniqueBehaviorNames(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      // TODO: This has problems after the entity is updated, as the name now exists in the store.
      // if (this.observationBehaviorStore.lowercaseEntityMap()[control.value?.toLocaleLowerCase()])
      // const foundEntity = this.observationBehaviorStore.sortedBehaviors();
      // if (this.observationBehaviorStore.lowercaseEntityNames().has(control.value.toLocaleLowerCase() as Lowercase<string>)) {
      //   return {
      //     behaviorAlreadyExists: true,
      //   };
      // }

      return null;
    };
  }
}
