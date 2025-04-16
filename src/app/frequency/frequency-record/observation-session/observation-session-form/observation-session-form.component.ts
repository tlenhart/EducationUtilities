import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  OnDestroy,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatIconAnchor, MatIconButton } from '@angular/material/button';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { signalMethod } from '@ngrx/signals';
import { liveQuery } from 'dexie';
import { debounceTime, distinctUntilChanged, from, Observable, Subscription, switchMap } from 'rxjs';
import { Temporal } from 'temporal-polyfill';
import { eduUtilsDb } from '../../../../core/db/edu-utils.db';
import { DexieResult } from '../../../../models/dexie-result.model';
import {
  BehaviorId,
  ObservationEntry,
  ObservationEntryId,
  ObservationSessionId,
} from '../../../../models/observation.model';
import { InsertDbType } from '../../../../scheduler-base/models/db.types';
import { SettingsStore } from '../../../../settings/settings.store';
import { ButtonWithIconComponent } from '../../../../shared/button-with-icon/button-with-icon.component';
import { ZonedDateTimePipe } from '../../../../shared/pipes/zoned-date-time/zoned-date-time.pipe';
import { CurrentObservationSessionStore } from '../../../../shared/stores/current-observation-session.store';
import { FrequencyDataSplitPaneStore } from '../../../../shared/stores/frequency-data-split-pane.store';
import { ObservationBehaviorStore } from '../../../../shared/stores/observation-behavior.store';
import { StudentStore } from '../../../../shared/stores/student.store';
import { toDurationLike } from '../../../../utils/time.utils';
import {
  ObservationSessionEntriesComponent,
} from '../observation-session-entries/observation-session-entries.component';

@Component({
  selector: 'eu-observation-session-form',
  imports: [
    MatButton,
    ButtonWithIconComponent,
    AsyncPipe,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatCardActions,
    ZonedDateTimePipe,
    MatTooltip,
    ReactiveFormsModule,
    MatInput,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatIconAnchor,
    RouterLink,
    ObservationSessionEntriesComponent,
  ],
  templateUrl: './observation-session-form.component.html',
  styleUrl: './observation-session-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObservationSessionFormComponent implements OnDestroy {
  /*
   * DI.
   */

  public readonly studentStore = inject(StudentStore);
  public readonly behaviorStore = inject(ObservationBehaviorStore);
  public readonly currentObservationSessionStore = inject(CurrentObservationSessionStore);
  public readonly settingsStore = inject(SettingsStore);
  private readonly frequencyDataSplitPaneStore = inject(FrequencyDataSplitPaneStore);
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  /*
   * Inputs.
   */

  public readonly isComparisonStudent: InputSignal<boolean> = input.required<boolean>();
  public readonly isPrimaryStudent: InputSignal<boolean> = input.required<boolean>();

  public readonly hapticFeedbackAvailable: Signal<boolean> = signal(!!navigator.vibrate);

  private readonly useHapticFeedback: Signal<boolean> = computed(() => {
    const hapticFeedbackAvailable = this.hapticFeedbackAvailable();
    const enableHapticFeedback = this.settingsStore.frequencyDataSettings.enableHapticFeedback();

    return hapticFeedbackAvailable && enableHapticFeedback;
  });

  /* Form Controls */
  public readonly notesFormControl: FormControl<string>;

  /*
   * Change updaters.
   */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- id is used to track changes, even though it isn't used within the effect method itself.
  private readonly sessionChangedEffect = signalMethod((id: ObservationSessionId) => {
    // Clear the current timeout, if there is one.
    self.clearTimeout(this.countdownTimer);

    const notesValue: string | undefined = this.isPrimaryStudent()
      ? this.currentObservationSessionStore.currentObservation.notes()
      : this.currentObservationSessionStore.currentObservation.comparisonStudentNotes();

    this.notesFormControl.setValue(notesValue ?? '');
  });

  private readonly studentRouteBuilder = computed(() => {
    return this.frequencyDataSplitPaneStore.specificStudentRoute();
  });

  public readonly editStudentRoute = computed(() => {
    const currentStudent = this.currentObservationSessionStore.currentStudent();
    return this.studentRouteBuilder()(currentStudent?.id);
  });

  public readonly sessionNotesLabelPlaceholder = computed(() => {
    return `Session notes for ${this.isPrimaryStudent() ? 'primary' : 'comparison'} student.`;
  });

  public readonly behaviorCounts: Record<BehaviorId, Observable<number>> = {};
  // public readonly timeRemaining: WritableSignal<Temporal.Duration | undefined> = signal(undefined);
  public readonly timeRemaining: WritableSignal<string> = signal('');
  private countdownTimer: number | undefined = undefined;

  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    this.notesFormControl = this.fb.control<string>({ value: '', disabled: false });

    this.subscriptions.add(this.notesFormControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((noteData: string) => {
          return from(this.currentObservationSessionStore.updateSessionNotes(noteData, this.isPrimaryStudent()));
        }),
      )
      .subscribe((noteData: DexieResult<boolean>) => {
        // TODO: This should really be queued.
        // Note updated.
      }));

    effect(() => {
      const student = this.studentStore.primaryEntity();
      const behaviorIds = student?.behaviors ?? [];

      if (behaviorIds.length > 0) {
        // console.warn('creating observables');
        for (const behaviorId of behaviorIds) {
          this.behaviorCounts[behaviorId] = this.countQueryBuilder(behaviorId);
        }
      }
    });

    // We use a signalMethod here to only trigger updates when the signal id changes, and not specific values.
    this.sessionChangedEffect(this.currentObservationSessionStore.currentObservation.id);
  }

  public ngOnDestroy(): void {
    self.clearTimeout(this.countdownTimer);
    this.subscriptions.unsubscribe();
  }

  public async startSession(): Promise<void> {
    // const sessionLength = this.currentObservationSessionStore.currentObservation.definedInitialSessionLength();
    // const interval = Temporal.Duration.from({ minutes: sessionLength as number }); // TODO: Fix.
    // let duration2 = dateTime.until(Temporal.Now.plainDateTimeISO());
    // console.log(duration2.toLocaleString(undefined, { style: 'digital', hours: '2-digit', minutes: '2-digit', seconds: '2-digit', smallestUnit: 'seconds', fractionalDigits: 0 }));
    const result = await this.currentObservationSessionStore.startObservationSession();

    if (result.result) {
      // Start the countdown timer.
      this.runCountdownTimer();
    }
  }

  private runCountdownTimer(): void {
    const startTime = this.currentObservationSessionStore.currentObservation.startTime();
    if (!startTime) {
      return;
    }

    // const now = Temporal.Now.instant();
    const now = Temporal.Now.zonedDateTimeISO();
    const initialDuration = toDurationLike(this.currentObservationSessionStore.currentObservation.definedInitialSessionLength());
    // console.log(initialDuration);
    const endTime = startTime.add(initialDuration);
    // const elapsed: Temporal.Duration = now.since(startTime.toInstant());

    const remaining: Temporal.Duration = now.until(endTime).round('seconds');

    // this.timeRemaining.set(remaining.toString({ smallestUnit: 'seconds' }));
    // this.timeRemaining.set(remaining.toLocaleString());

    if (remaining.total('second') <= 0) {
      this.timeRemaining.set('00:00:00');
      return;
    }

    this.timeRemaining.set(`${remaining.hours.toString(10).padStart(2, '0')}:${remaining.minutes.toString(10).padStart(2, '0')}:${remaining.seconds.toString(10).padStart(2, '0')}`);

    // Run the method again in 1 second.
    this.countdownTimer = self.setTimeout(() => {
      this.runCountdownTimer();
    }, 1000);
  }

  public async resumeSession(): Promise<void> {
    const result = await this.currentObservationSessionStore.resumeObservationSession();
  }

  public async endSession(): Promise<void> {
    // const result = await this.currentObservationSessionStore.clearSessionStart();
    const result = await this.currentObservationSessionStore.endObservationSession();
  }

  public async addObservationEntry(behaviorId: BehaviorId): Promise<void> {
    if (this.useHapticFeedback()) {
      navigator.vibrate([30]);
    }

    const success = await this.currentObservationSessionStore.addBehaviorEntry({
      observationSessionId: this.currentObservationSessionStore.currentObservation.id(),
      behaviorId: behaviorId,
      notes: '',
      timestamp: Temporal.Now.zonedDateTimeISO(),
      isComparisonStudent: this.isComparisonStudent(),
    } as InsertDbType<ObservationEntry>);
  }

  public async deleteObservationEntry(entryId: ObservationEntryId): Promise<void> {
    const result = await this.currentObservationSessionStore.removeBehaviorEntry(entryId);

    if (!result.result || result.error) {
      console.error(`Error deleting ${entryId} from database.`, result.error);
    }
  }

  public async updateObservationEntryNote(entryId: ObservationEntryId, note: string): Promise<void> {
    const result = await this.currentObservationSessionStore.updateBehaviorEntryNote(entryId, note);
  }

  public async showHideComparisonStudent(showHide: boolean): Promise<void> {
    await this.currentObservationSessionStore.showHideComparisonStudent(showHide);
  }

  public toggleHapticFeedback(): void {
    this.settingsStore.toggleFrequencyDataHapticFeedback();
  }

  private countQueryBuilder(behaviorId: BehaviorId) {
    // TODO: Move to store.
    // TODO: Or, just use the filtered array entries and return the length? with computed?
    return from(liveQuery(async () => {
      return eduUtilsDb.observationEntries.where({
        observationSessionId: this.currentObservationSessionStore.currentObservation.id(),
        behaviorId: behaviorId,
      })
        .and((value) => value.isComparisonStudent === this.isComparisonStudent())
        .distinct()
        .count();
    }));
  }
}
