import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  input,
  InputSignal,
  OnDestroy,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { Temporal } from 'temporal-polyfill';
import { DateTimeFormatDefaults, IntlDateTimeFormatOptions } from '../../defaults/date-time-format.defaults';
import { FormGroupOf3 } from '../../models/forms.types';
import { ZonedDateTimePipe } from '../../shared/pipes/zoned-date-time/zoned-date-time.pipe';
import { DisplaySettings, OptionalDateTimeDisplaySettings } from '../settings.model';
import { SettingsStore } from '../settings.store';

export type DateTimeFormatForm = FormGroupOf3<Pick<DisplaySettings, 'useDetailedDateTimeFormatting' | 'dateTimeFormat'>>;
export type OptionalDateTimeDisplaySettingsForm = FormGroupOf3<OptionalDateTimeDisplaySettings>;

@Component({
  selector: 'eu-date-time-format-settings',
  imports: [
    FormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    ZonedDateTimePipe,
  ],
  templateUrl: './date-time-format-settings.component.html',
  styleUrl: './date-time-format-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeFormatSettingsComponent implements OnDestroy {
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  public readonly settingsStore = inject(SettingsStore);

  public dateOnly: InputSignal<boolean> = input<boolean>(false);
  public timeOnly: InputSignal<boolean> = input<boolean>(false);

  private readonly undoStack: Array<string> = [];
  private readonly redoStack: Array<string> = [];
  private readonly undoRedoActionPerformed: WritableSignal<boolean> = signal(false);
  private readonly subscriptions: Subscription = new Subscription();

  // public readonly allDateTimeFormatSettingsForm: FormGroup<>
  public readonly dateTimeFormatForm: FormGroup<DateTimeFormatForm>;
  public readonly timeOnlyFormatForm: FormGroup<OptionalDateTimeDisplaySettingsForm>;
  public readonly dateOnlyFormatForm: FormGroup<OptionalDateTimeDisplaySettingsForm>;
  public readonly dateTimeValueToDisplay: Signal<Temporal.ZonedDateTime> = signal(Temporal.ZonedDateTime.from({
    year: 2025,
    month: 1,
    day: 2,
    hour: 15,
    minute: 0,
    second: 0,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }));
  private readonly dateTimeValueFormat: WritableSignal<Intl.DateTimeFormatOptions> = signal({});

  public readonly dateTimeFormatDefaults: IntlDateTimeFormatOptions = DateTimeFormatDefaults;

  @HostListener('window:keydown.control.z', ['$event'])
  public undoSettingsChange(event: KeyboardEvent): void {
    event.preventDefault();
    this.handleUndoEvent();
  }

  @HostListener('window:keydown.control.y', ['$event'])
  public redoSettingsChange(event: KeyboardEvent): void {
    event.preventDefault();
    this.handleRedoEvent();
  }

  constructor() {
    this.timeOnlyFormatForm = this.fb.group<OptionalDateTimeDisplaySettingsForm>({
      enabled: this.fb.control({ value: false, disabled: false }),
      useDetailedFormatting: this.fb.control({ value: false, disabled: false }),
      format: this.buildIntlDateTimeFormatOptionsFormGroup(),
    });

    this.dateOnlyFormatForm = this.fb.group<OptionalDateTimeDisplaySettingsForm>({
      enabled: this.fb.control({ value: false, disabled: false }),
      useDetailedFormatting: this.fb.control({ value: false, disabled: false }),
      format: this.buildIntlDateTimeFormatOptionsFormGroup(),
    });

    this.dateTimeFormatForm = this.fb.group<DateTimeFormatForm>({
      useDetailedDateTimeFormatting: this.fb.control({ value: false, disabled: false }),
      dateTimeFormat: this.buildIntlDateTimeFormatOptionsFormGroup(),
    });

    // Set up listener that adds changes to the undo stack.
    // This should be done before setting the first value, so the first value is set in the undo stack.
    this.subscriptions.add(this.dateTimeFormatForm.controls.dateTimeFormat.valueChanges.subscribe({
      next: (newValue: Intl.DateTimeFormatOptions) => {
        if (!this.undoRedoActionPerformed()) {
          this.undoStack.push(JSON.stringify(newValue));
          this.redoStack.length = 0; // Clear the redo stack when a new action is performed.
        } else {
          // Don't update the stack when a new value is set from an undo/redo.
          this.undoRedoActionPerformed.set(false);
        }
      },
    }));

    // Set the initial format value from the settings.
    this.dateTimeFormatForm.controls.dateTimeFormat.reset(this.settingsStore.displaySettings.dateTimeFormat());
    this.dateTimeValueFormat.set(this.dateTimeFormatForm.controls.dateTimeFormat.value);
    this.undoStack.push(JSON.stringify(this.dateTimeValueFormat()));

    this.subscriptions.add(this.dateTimeFormatForm.controls.dateTimeFormat.valueChanges.subscribe({
      next: (newValue: Intl.DateTimeFormatOptions) => {
        this.dateTimeValueFormat.set(newValue); // TODO: This might be unnecessary.

        // this.settingsStore.updateDisplaySettings({ dateTimeFormat: newValue });
        this.settingsStore.updateDateTimeFormatSettings(newValue);
      },
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private handleUndoEvent(): void {
    if (this.undoStack.length > 1) {
      const current = this.undoStack.pop();
      const previous = this.undoStack.at(-1);

      if (current) {
        this.undoRedoActionPerformed.set(true);
        this.redoStack.unshift(current);
      }

      if (previous) {
        this.setDateTimeFormatForm(previous);
      }

    } else if (this.undoStack.length === 1) {
      this.setDateTimeFormatForm(this.undoStack[0]);
    }
  }

  private handleRedoEvent(): void {
    if (this.redoStack.length > 0) {
      const next = this.redoStack.shift();

      this.undoRedoActionPerformed.set(true);
      if (next) {
        this.undoStack.push(next);
        this.setDateTimeFormatForm(next);
      }
    }
  }

  private setDateTimeFormatForm(formatOptions: string): void {
    this.undoRedoActionPerformed.set(true);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- The type from the stack should already be the correct type.
    const data: Partial<Intl.DateTimeFormatOptions> = JSON.parse(formatOptions);
    this.dateTimeFormatForm.controls.dateTimeFormat.reset(data);
  }

  private buildIntlDateTimeFormatOptionsFormGroup(): FormGroup<FormGroupOf3<Intl.DateTimeFormatOptions>> {
    return this.fb.group<FormGroupOf3<Intl.DateTimeFormatOptions>>({
      // timeZone: this.fb.control({ value: undefined, disabled: false }),
      // calendar: this.fb.control({ value: undefined, disabled: false }),
      // numberingSystem: this.fb.control({ value: undefined, disabled: false }),

      localeMatcher: this.fb.control({ value: undefined, disabled: false }),
      weekday: this.fb.control({ value: undefined, disabled: false }),
      era: this.fb.control({ value: undefined, disabled: false }),
      year: this.fb.control({ value: undefined, disabled: false }),
      month: this.fb.control({ value: undefined, disabled: false }),
      day: this.fb.control({ value: undefined, disabled: false }),
      hour: this.fb.control({ value: undefined, disabled: false }),
      minute: this.fb.control({ value: undefined, disabled: false }),
      second: this.fb.control({ value: undefined, disabled: false }),
      timeZoneName: this.fb.control({ value: undefined, disabled: false }),
      formatMatcher: this.fb.control({ value: undefined, disabled: false }),
      hour12: this.fb.control({ value: undefined, disabled: false }),
      dayPeriod: this.fb.control({ value: undefined, disabled: false }),
      dateStyle: this.fb.control({ value: 'medium', disabled: false }),
      timeStyle: this.fb.control({ value: 'short', disabled: false }),
      hourCycle: this.fb.control({ value: undefined, disabled: false }),
      fractionalSecondDigits: this.fb.control({ value: undefined, disabled: false }),
    });
  }
}
