import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal, model, ModelSignal,
  OnDestroy,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup, NG_VALUE_ACCESSOR,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { arrayToArrayOfFormControls } from '../../../utils/form.utils';
import {
  ControlValueAccessorDefaultChangeMethods
} from '../../models/control-value-accessor-default-change-methods.model';
import { AvailabilitySchedule } from '../../models/person-type.model';
import { ScheduleTime } from '../../models/schedule-time.model';
import { AidStore } from '../../stores/aid.store';
import { AvailabilityEntryComponent } from './availability-entry/availability-entry.component';
import { Temporal } from 'temporal-polyfill';

// type AvailabilityFormType = FormGroup<{ [K in keyof ScheduleTime]: FormControl }>;
type AvailabilityFormGroupType = FormGroup<{ availabilityEntries: FormArray<FormControl<ScheduleTime>> }>;

@Component({
  selector: 'eu-availability',
  imports: [
    AvailabilityEntryComponent,
    ReactiveFormsModule,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: AvailabilityComponent,
    },
    // {
    //   provide: NG_VALIDATORS,
    //   multi: true,
    //   useExisting: AvailabilityComponent,
    // }
  ],
})
export class AvailabilityComponent extends ControlValueAccessorDefaultChangeMethods<AvailabilitySchedule> implements ControlValueAccessor, OnInit, OnDestroy {
  public readonly id: InputSignal<number> = input.required<number>();
  public readonly availabilityEntries: ModelSignal<AvailabilitySchedule> = model<AvailabilitySchedule>([]);
  private currentId: number = -1;

  public readonly availabilityUpdates: OutputEmitterRef<AvailabilitySchedule> = output();

  public readonly availabilityFormGroup: AvailabilityFormGroupType; // = computed(() => {
  //   console.log('this.availabilityFormGroup', this.id());
  //   const aidId = this.id();
  //
  //   if (!aidId) {
  //     return this.fb.group({
  //       availabilityEntries: this.fb.AvailabilitySchedule([
  //       ]),
  //     });
  //   }
  //
  //   const aid = this.aidStore.getAid(aidId);
  //
  //   // TODO: Determine what to do here. (If anything.)
  //   if (!aid) {
  //     return this.fb.group({
  //       availabilityEntries: this.fb.AvailabilitySchedule([
  //       ]),
  //     });
  //   }
  //
  //   return this.fb.group({
  //     availabilityEntries: this.fb.array(arrayToArrayOfFormControls(aid.schedule, this.fb)),
  //   });
  // });

  // public readonly availabilityForm: Signal<FormArray<FormControl<ScheduleTime>>> = computed(() => {
  //   const aidId = this.id();
  //
  //   if (!aidId) {
  //     return this.fb.AvailabilitySchedule([
  //     ]);
  //   }
  //
  //   const aid = this.aidStore.getAid(aidId);
  //
  //   // TODO: Determine what to do here. (If anything.)
  //   if (!aid) {
  //     return this.fb.AvailabilitySchedule([
  //     ]);
  //   }
  //
  //   return this.fb.array(arrayToArrayOfFormControls(aid.availability ?? [], this.fb));
  // });

  // public get availabilityEntries(): FormArray<FormControl<ScheduleTime>> {
  //   return this.availabilityFormGroup().controls.availabilityEntries;
  // }

  private readonly aidStore = inject(AidStore);

  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private availabilityUpdateSubscription: Subscription | undefined;

  constructor() {
    super();
    // this.availabilityForm = this.fb.AvailabilitySchedule(Array.from(toArrayOfFormControls()));

    // effect(() => {
    //   const formGroup = this.availabilityFormGroup();
    //   console.log('effect');
    //
    //   this.availabilityUpdateSubscription?.unsubscribe();
    //
    //   // setInterval(() => {
    //   //   console.log(formGroup.value.availabilityEntries);
    //   // }, 2000);
    //
    //   this.availabilityUpdateSubscription = formGroup.controls.availabilityEntries.valueChanges.subscribe((updatedEntries) => {
    //     console.log('updatedAvailabilityEntries', updatedEntries);
    //     this.availabilityUpdates.emit(updatedEntries);
    //   });
    // });

    // setInterval(() => {
    //   this.onChange([...this.availabilityEntries()]);
    // }, 1000);

    this.availabilityFormGroup = this.fb.group({
      availabilityEntries: this.fb.array<ScheduleTime>([
      ]),
    });

    this.availabilityUpdateSubscription = this.availabilityFormGroup.controls.availabilityEntries.valueChanges.subscribe((updatedEntries) => {
      console.log('updatedAvailabilityEntries', updatedEntries);
      this.availabilityUpdates.emit(updatedEntries);
      this.onChange([...updatedEntries]);
    });
  }

  public ngOnInit(): void {
    // void (async () => {
    //   await this.aidStore.updateAidAvailability(this.id(),
    //     [
    //       {
    //         startTime: Temporal.PlainTime.from('08:00'),
    //         endTime: Temporal.PlainTime.from('09:00'),
    //         days: [TemporalDayOfWeek.Monday, TemporalDayOfWeek.Tuesday],
    //       } as ScheduleTime,
    //       {
    //         startTime: Temporal.PlainTime.from('09:00'),
    //         endTime: Temporal.PlainTime.from('11:00'),
    //         days: [TemporalDayOfWeek.Wednesday, TemporalDayOfWeek.Tuesday, TemporalDayOfWeek.Wednesday],
    //       } as ScheduleTime,
    //     ]);
    // })();
  }

  // TODO: Call onChange();
  // availabilityEntries

  public ngOnDestroy(): void {
    this.availabilityUpdateSubscription?.unsubscribe();
  }

  public addAvailability(): void {
    this.markAsTouched();

    const newEntry: ScheduleTime = {
      startTime: Temporal.PlainTime.from('12:11'),
      endTime: Temporal.PlainTime.from('13:42'),
      days: [],
    };

    this.addEntry(newEntry);
    this.availabilityEntries().push(newEntry);
    // this.availabilityEntries.update((current) => {
    //   return [...current, newEntry];
    // });

    // this.availabilityFormGroup().updateValueAndValidity({ emitEvent: true, onlySelf: false });
    // console.log('add', this.availabilityFormGroup.controls.availabilityEntries.value);

    this.onChange([...this.availabilityEntries()]);
    this.availabilityUpdates.emit(this.availabilityFormGroup.controls.availabilityEntries.getRawValue());
  }

  public removeAvailability(index: number): void {
    this.markAsTouched();

    this.availabilityFormGroup.controls.availabilityEntries.removeAt(index);
    this.availabilityEntries().splice(index, 1);
    this.onChange([...this.availabilityEntries()]);

    // this.onChange(this.availabilityFormGroup.controls.availabilityEntries.value); // ?

    this.availabilityUpdates.emit(this.availabilityFormGroup.controls.availabilityEntries.value);
  }

  /* ControlValueAccessor methods */

  public writeValue(value: AvailabilitySchedule): void {
    this.availabilityEntries.set(value);

    this.availabilityFormGroup.controls.availabilityEntries.clear(); // emit: false ?

    for (const entry of value) {
      this.addEntry(entry);
    }

    console.log('writeValue availabilityComponent.', value);
    this.availabilityFormGroup.controls.availabilityEntries.setValue(value);
  }

  public registerOnChange(fn: (changeValue: AvailabilitySchedule) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  /* End ControlValueAccessor methods */

  private addEntry(formEntry: ScheduleTime): void {
    this.availabilityFormGroup.controls.availabilityEntries.push(
      this.fb.control<ScheduleTime>(formEntry),
    );
  }
}
