import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  InputSignal,
  InputSignalWithTransform, linkedSignal,
  model,
  ModelSignal,
  Signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Temporal } from 'temporal-polyfill';
import { BasicTimeInput, PlainTimeInput } from '../../../models/time.model';
import { getSequentialId } from '../../../utils/dom.utils';
import { basicTimeInputRegex } from '../../../utils/time.utils';
import {
  ControlValueAccessorDefaultChangeMethods,
} from '../../models/control-value-accessor-default-change-methods.model';

@Component({
  selector: 'eu-temporal-time-input',
  imports: [
    FormsModule,
  ],
  templateUrl: './temporal-time-input.component.html',
  styleUrl: './temporal-time-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: TemporalTimeInputComponent,
    },
  ],
})
export class TemporalTimeInputComponent extends ControlValueAccessorDefaultChangeMethods<Temporal.PlainTime> implements ControlValueAccessor {

  // public readonly startTime: ModelSignal<Temporal.PlainTime> = model.required();
  public readonly time: ModelSignal<PlainTimeInput> = model<PlainTimeInput>(Temporal.PlainTime.from('00:00'));

  public readonly linkedTime = linkedSignal<PlainTimeInput, Temporal.PlainTime>({
    source: this.time,
    computation: (selectedTime: PlainTimeInput, previous) => {
      // previous.
      if (selectedTime instanceof Temporal.PlainTime) {
        return selectedTime;
      } else {
        // ! Infinite loop warning !
        return this.convertTime(selectedTime);
        // this.onChange(this.convertTime(selectedTime));
      }
    },
  });

  // public readonly activityId: InputSignal<UUID> = input.required();
  public readonly htmlIdSuffix: InputSignal<string> = input<string>(getSequentialId.next().value);
  public readonly label: InputSignal<string> = input.required<string>();
  public readonly showLabel: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
    transform: (value: BooleanInput) => {
      return coerceBooleanProperty(value);
    },
  });

  public readonly timeHtmlId: Signal<string> = computed(() => {
    return `timeInput-${this.htmlIdSuffix()}`;
  });


  constructor() {
    super();

    // Whenever the value of the input changes, notify the change listener and convert, if necessary, to the correct Temporal.PlainTime object type.
    effect(() => {
      // this.markAsTouched(); // TODO: Might need to skip the first time.
      // If initial value not changed and value === initial value?

      const selectedTime = this.time();
      console.log('typeof time', typeof this.time());

      if (selectedTime instanceof Temporal.PlainTime) {
        this.onChange(selectedTime);
      } else {
        // ! Infinite loop warning !
        // this.time.set(this.convertTime(selectedTime));
        const convertedTime = this.convertTime(selectedTime);
        this.time.set(convertedTime);
        this.onChange(convertedTime);
        // this.onChange(this.convertTime(selectedTime));
      }
    });
  }

  /* ControlValueAccessor methods */

  public writeValue(value: PlainTimeInput): void {
    if (value instanceof Temporal.PlainTime) {
      this.time.set(value);
    } else if (typeof value === 'string') {
      if (basicTimeInputRegex.test(value)) {
        this.time.set(this.convertTime(value));
      }
    }
    console.log('writeValue', value, value instanceof Temporal.PlainTime);
    // throw new Error('Method not implemented.');
  }

  public registerOnChange(fn: (time: PlainTimeInput) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  /* End ControlValueAccessor methods */

  private convertTime(time: BasicTimeInput): Temporal.PlainTime {
    return Temporal.PlainTime.from(time);
  }
}
