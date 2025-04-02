import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
  ModelSignal,
  OnDestroy,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Temporal } from 'temporal-polyfill';
import { SettingsStore } from '../../../../settings/settings.store';
import {
  ControlValueAccessorDefaultChangeMethods,
} from '../../../models/control-value-accessor-default-change-methods.model';
import { ScheduleTime, TemporalDayOfWeek } from '../../../models/schedule-time.model';
import { DayPickerComponent } from '../../day-picker/day-picker.component';
import { TemporalTimeInputComponent } from '../../temporal-time-input/temporal-time-input.component';

type AvailabilityEntryFormType = { [K in keyof ScheduleTime]: FormControl<ScheduleTime[K]> };

@Component({
  selector: 'eu-availability-entry',
  imports: [
    ReactiveFormsModule,
    TemporalTimeInputComponent,
    DayPickerComponent,
    JsonPipe,

  ],
  templateUrl: './availability-entry.component.html',
  styleUrl: './availability-entry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: AvailabilityEntryComponent,
    },
    // {
    //   provide: NG_VALIDATORS,
    //   multi: true,
    //   useExisting: AvailabilityEntryComponent,
    // }
  ],
})
export class AvailabilityEntryComponent extends ControlValueAccessorDefaultChangeMethods<ScheduleTime> implements ControlValueAccessor, OnDestroy {
  public readonly availabilityEntry: ModelSignal<ScheduleTime> = model<ScheduleTime>({} as ScheduleTime);
  public readonly dayPickerAriaLabel: Signal<string>;

  public readonly availabilityEntryFormGroup: FormGroup<AvailabilityEntryFormType>;

  /* DI services. */
  public readonly settingsStore = inject(SettingsStore);
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    super();

    // TODO: Make sure ControlValueAccessor with FormGroup works correctly and that there is nothing else that needs to be done.
    this.availabilityEntryFormGroup = this.fb.group<AvailabilityEntryFormType>({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      startTime: this.fb.control(Temporal.PlainTime.from('08:00'), { validators: [Validators.required] }),
      // eslint-disable-next-line @typescript-eslint/unbound-method
      endTime: this.fb.control(Temporal.PlainTime.from('09:00'), { validators: [Validators.required] }),
      days: this.fb.control([TemporalDayOfWeek.Tuesday]),
    }, { updateOn: 'change' });

    // TODO: Make sure this doesn't memory leak.
    const startTimeSignal = toSignal(this.availabilityEntryFormGroup.controls.startTime.valueChanges);
    const endTimeSignal = toSignal(this.availabilityEntryFormGroup.controls.endTime.valueChanges);

    this.dayPickerAriaLabel = computed(() => {
      return `Days associated with the availability entry ${startTimeSignal()?.toString() ?? ''} - ${endTimeSignal()?.toString() ?? ''}.`;
    });

    this.subscriptions.add(this.availabilityEntryFormGroup.valueChanges.subscribe((updatedValue: Partial<ScheduleTime>) => {
      this.markAsTouched();

      console.log('availabilityEntry updated');

      // Update the model.
      this.availabilityEntry.update((current: ScheduleTime) => {
        return {
          ...current,
          ...updatedValue,
        };
      });

      // Update the form control.
      this.onChange(this.availabilityEntry());
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /* ControlValueAccessor methods */

  public writeValue(value: ScheduleTime): void {
    this.availabilityEntry.set(value);
    this.availabilityEntryFormGroup.setValue(value);
  }

  public registerOnChange(fn: (changeValue: ScheduleTime) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  /* End ControlValueAccessor methods */
}
