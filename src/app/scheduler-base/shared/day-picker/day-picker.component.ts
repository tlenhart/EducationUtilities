import { CdkListbox, CdkOption, ListboxValueChangeEvent } from '@angular/cdk/listbox';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  OnDestroy,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SettingsStore } from '../../../settings/settings.store';
import { DayOfWeekEnumPipe } from '../../../shared/pipes/day-of-week-enum/day-of-week-enum.pipe';
import { getSequentialId } from '../../../utils/dom.utils';
import {
  ControlValueAccessorDefaultChangeMethods,
} from '../../models/control-value-accessor-default-change-methods.model';
import { getDaysOfWeek, TemporalDayOfWeek } from '../../models/schedule-time.model';

// export type DayPickerValues = Array<TemporalDayOfWeek> | Set<TemporalDayOfWeek>;
export type DayPickerValues = ReadonlyArray<TemporalDayOfWeek>;

@Component({
  selector: 'eu-day-picker',
  imports: [
    CdkListbox,
    CdkOption,
    FormsModule,
    DayOfWeekEnumPipe,
  ],
  templateUrl: './day-picker.component.html',
  styleUrl: './day-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: DayPickerComponent,
    },
    // {
    //   provide: NG_VALIDATORS,
    //   multi: true,
    //   useExisting: TemporalTimeInputComponent,
    // }
  ],
})
export class DayPickerComponent extends ControlValueAccessorDefaultChangeMethods<ReadonlyArray<TemporalDayOfWeek>> implements ControlValueAccessor, OnDestroy {
  private readonly idSuffix: string = getSequentialId.next().value;

  /* Injected Dependencies */
  private readonly settingsStore = inject(SettingsStore);

  public readonly listbox = viewChild(CdkListbox);

  // TODO: Remove days?
  public readonly days: WritableSignal<Array<TemporalDayOfWeek>> = signal<Array<TemporalDayOfWeek>>([]);
  public readonly ariaLabel: InputSignal<string> = input.required();
  public readonly pickerLabelIdSuffix: InputSignalWithTransform<string, string | undefined> = input(
    `day-picker-label-${this.idSuffix}`,
    {
      transform: (suffix: string | undefined): string => {
        return `day-picker-label-${suffix ?? this.idSuffix}`;
      },
    });

  public readonly daysOfWeek: Signal<ReadonlyArray<TemporalDayOfWeek>> = computed(() => {
    return getDaysOfWeek(this.settingsStore.schedulerSettings.date.excludeDays(), this.settingsStore.schedulerSettings.date.weekStart());
  });

  private listboxValueChangeSubscription?: Subscription;

  constructor() {
    super();

    // Whenever the listbox changes, (generally this should only be once), update the subscription for the value changes so changes get propagated.
    effect(() => {
      const listbox = this.listbox();

      this.listboxValueChangeSubscription?.unsubscribe();

      if (!listbox) {
        return;
      }

      this.listboxValueChangeSubscription = listbox.valueChange.subscribe((event: ListboxValueChangeEvent<TemporalDayOfWeek>) => {
        this.markAsTouched();
        this.onChange(event.value);
      });
    });
  }

  public ngOnDestroy(): void {
    // TODO: Consider using SelectionModel from @angular/cdk.
    this.listboxValueChangeSubscription?.unsubscribe();
  }

  /* ControlValueAccessor methods */

  public writeValue(dates: ReadonlyArray<TemporalDayOfWeek> | undefined): void {
    if (!dates) {
      this.days.set([]);
    } else if (Array.isArray(dates)) {
      this.days.set([...(dates as Array<TemporalDayOfWeek>)]);
    } else {
      this.days.set(dates as Array<TemporalDayOfWeek>);
    }
  }

  public registerOnChange(fn: (days: ReadonlyArray<TemporalDayOfWeek>) => void): void {
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
