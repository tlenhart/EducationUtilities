import { NgClass, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, Signal, signal, WritableSignal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, finalize, Subscription } from 'rxjs';
import { AppLocationService } from '../core/app-location/app-location.service';
import { AppVersionService } from '../core/version/app-version.service';
import { AppRoute } from '../models';
import { FeedbackForm, FeedbackType } from '../models/feedback.model';
import { SettingsStore } from '../settings/settings.store';

@Component({
  selector: 'eu-feedback-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatError,
    MatFormField,
    MatInput,
    MatIconButton,
    MatLabel,
    MatIcon,
    MatSuffix,
    MatProgressSpinner,
    MatRadioGroup,
    MatRadioButton,
    TitleCasePipe,
    MatCheckbox,
    MatTooltip,
    MatSelect,
    MatOption,
    NgClass,
  ],
  templateUrl: './feedback-dialog.component.html',
  styleUrl: './feedback-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackDialogComponent implements OnDestroy {
  public readonly submitting: WritableSignal<boolean> = signal(false);
  public readonly submitError: WritableSignal<boolean> = signal(false);

  public readonly settingsStore = inject(SettingsStore);

  private readonly appLocationService: AppLocationService = inject(AppLocationService);
  private readonly appVersionService: AppVersionService = inject(AppVersionService);
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly http: HttpClient = inject(HttpClient);
  private readonly dialogRef = inject(MatDialogRef<FeedbackDialogComponent>);

  public readonly routes: Signal<ReadonlyArray<AppRoute>> = this.appLocationService.routes;
  public readonly feedbackTypes: Signal<Array<FeedbackType>> = signal([
    'bug',
    'feature',
    'accessibility',
    'other',
  ]);

  public readonly feedbackForm: FormGroup<FeedbackForm>;
  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    this.feedbackForm = this.fb.group({
      /* eslint-disable @typescript-eslint/unbound-method */
      doesNotContainPrivateInformation: this.fb.control({ value: false, disabled: false }, [Validators.requiredTrue]),
      feedbackMessage: this.fb.control({ value: '', disabled: false }, [Validators.required]),
      secret: this.fb.control({ value: this.settingsStore.feedbackSettings.secret(), disabled: false }, [Validators.required]),
      type: this.fb.control<FeedbackType>({ value: 'bug', disabled: false }, [Validators.required]),
      utility: this.fb.control({ value: this.appLocationService.currentRoute()?.name ?? '', disabled: false }, [Validators.required]),
      version: this.fb.control({ value: this.appVersionService.version(), disabled: false }),
      /* eslint-enable @typescript-eslint/unbound-method */
    });

    this.subscriptions.add(
      this.feedbackForm.controls.secret.valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(200),
      ).subscribe({
        next: (updatedSecret: string) => {
          this.settingsStore.updateSecret(updatedSecret);
        },
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public submitFeedback(): void {
    this.submitting.set(true);
    this.feedbackForm.disable();
    this.dialogRef.disableClose = true;

    this.http.post('/api/submitFeedback', this.feedbackForm.getRawValue())
      .pipe(
        finalize(() => {
          this.submitting.set(false);
          this.feedbackForm.enable();
          this.dialogRef.disableClose = false;
        }),
        // catchError((err: unknown, caught: Observable<unknown>) => {
        //   return caught;
        // })
      )
      .subscribe({
        next: (result: unknown) => {
          console.log('success');
        },
        error: (err: unknown) => {
          console.error(err);
        },
      });
  }

  public showHideFeedback(event: MouseEvent): void {
    this.settingsStore.showHideFeedbackSecret(!this.settingsStore.feedbackSettings.showSecret());
    event.stopPropagation();
  }
}
