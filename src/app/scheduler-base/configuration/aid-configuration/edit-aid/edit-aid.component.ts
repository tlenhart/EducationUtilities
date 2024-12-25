import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed, effect,
  inject,
  input,
  InputSignalWithTransform, OnDestroy,
  Signal,
} from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { SettingsStore } from '../../../../settings/settings.store';
import { Aid } from '../../../models/aid.model';
import { ScheduleTime } from '../../../models/schedule-time.model';
import { AvailabilityComponent } from '../../../shared/availability/availability.component';
import { AidStore } from '../../../stores/aid.store';
import { IdImportType } from '../../../../models/route-parameter.model';

export type EditAidForm = { [K in keyof Aid ]: FormControl<Aid[K]> };

@Component({
  selector: 'eu-edit-aid',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    JsonPipe,
    AvailabilityComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-aid.component.html',
  styleUrl: './edit-aid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAidComponent implements OnDestroy {
  // TODO: Might be best to do this through a resolver.
  public id: InputSignalWithTransform<number, IdImportType> = input.required<number, IdImportType>({
    transform: (value: IdImportType) => {
      if (typeof value !== 'number') {
        value = parseInt(value, 10);
      }

      if (isNaN(value)) {
        value = -1;
      }

      return value;
    }
  });

  // TODO: !!! When the id changes, we need to reset the form completely and immediately.

  // public readonly currentAid: Signal<Aid | undefined> = computed(() => this.aidStore.getAid(this.id()));

  public readonly currentAid: Signal<Aid | null> = computed(() => this.aidStore.selectedEntity());

  public readonly editAidForm: FormGroup<EditAidForm>;

  // public readonly availabilityFormControl: FormControl<ScheduleTime>;

  public readonly aidStore = inject(AidStore);

  public readonly settingsStore = inject(SettingsStore);

  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  private readonly subscriptions: Subscription = new Subscription();
  private currentId: number = -1;

  constructor() {
    this.editAidForm = this.fb.group<EditAidForm>({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      name: this.fb.control('', [Validators.required]),
      schedule: this.fb.control([]),
      id: this.fb.control({ value: -1, disabled: true }),
      scheduleId: this.fb.control({ value: -1, disabled: true }),
    }, { updateOn: 'change' });

    effect(() => {
      // console.log('selected entity', this.aidStore.selectedEntity());

      console.log('set selectedEntity2');

      const id = this.id();
      // TODO: Only do updates when the id changes, not the user!
      if (id !== this.currentId) {
        console.error('id changed');
        this.aidStore.setSelectedEntity(id);
        this.currentId = id;
        this.editAidForm.reset();
        this.subscriptions.unsubscribe();

        this.subscriptions.add(this.editAidForm.valueChanges.subscribe((value) => {
          // if (this.currentId)
          console.log('schedule changed', value);
          void (async () => {
            // await this.updateAidAvailability(value);
          })();
        }));

        this.subscriptions.add(this.editAidForm.controls.name.valueChanges.subscribe((updatedName: string) => {
          console.log('update aid name', updatedName);
          void (async () => {
            await this.updateAidName(updatedName);
          })();
        }));
      }
    });

    effect(() => {
      console.warn('this.currentAid changed', this.currentAid());
    });

    // TODO: This causes an infinite loop when a property of the aid is not available in the form itself!
    // effect(() => {
    //   // console.log('current aid changed', this.id());
    //
    //   // this.editAidForm.reset();
    //
    //   // this.subscriptions.unsubscribe();
    //
    //   // TODO: Where to set this value?
    //
    //   const currentAid = this.currentAid();
    //   if (currentAid) {
    //     // && this.currentId !== currentAid?
    //
    //     console.log('setting current aid');
    //     // this.subscriptions.unsubscribe();
    //     this.editAidForm.reset(undefined, { onlySelf: true, emitEvent: false });
    //
    //     // ? Event things correct here?
    //     this.editAidForm.setValue(currentAid, { emitEvent: false, onlySelf: true });
    //
    //     // this.subscriptions.add(this.editAidForm.valueChanges.subscribe((value) => {
    //     //   // if (this.currentId)
    //     //   console.log('schedule changed', value);
    //     //   void (async () => {
    //     //     // await this.updateAidAvailability(value);
    //     //   })();
    //     // }));
    //
    //     // this.subscriptions.add(this.editAidForm.controls.name.valueChanges.subscribe((updatedName: string) => {
    //     //   console.log('update aid name', updatedName);
    //     //   void (async () => {
    //     //     await this.updateAidName(updatedName);
    //     //   })();
    //     // }));
    //   }
    // });

    setInterval(() => {
      console.log(JSON.stringify(this.editAidForm.getRawValue()));
    }, 5000);

    this.subscriptions.add(this.editAidForm.controls.schedule.valueChanges.subscribe((value) => {
      // if (this.currentId)
      console.log('schedule changed', value);
      void (async () => {
        // TODO: Enabling this causes an infinite loop.
        // Could be due to ngrx generating a new object that gets pushed, which triggers the changes, which then gets pushed, ad infinitum.
        // await this.updateAidAvailability(value);
      })();
    }));

    // TODO: Handle Aid Changes!
    // this.subscriptions.add(this.editAidForm.valueChanges.subscribe((value) => {
    //   // if (this.currentId)
    //   console.log('schedule changed', value);
    //   void (async () => {
    //     // await this.updateAidAvailability(value);
    //   })();
    // }));
    //
    // this.subscriptions.add(this.editAidForm.controls.name.valueChanges.subscribe((updatedName: string) => {
    //   console.log('update aid name', updatedName);
    //   void (async () => {
    //     await this.updateAidName(updatedName);
    //   })();
    // }));

  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public async addAid(): Promise<void> {
    await this.aidStore.addAid({ name: `Name: ${Math.random().toFixed(7)}`, schedule: [] });
  }

  public async updateAid(): Promise<void> {
    // await this.aidStore.addAid({ name: `Test ${Math.random()}` });
    // await this.aidStore.updateAid(1, { name: 'Jeff 1', homeroom: 'Crying in the teacher\'s lounge' });
  }

  public reset(): void {
    this.editAidForm.reset();
  }

  private async updateAidName(value: string): Promise<void> {
    if (value) {
      // console.log(this.aidStore.aidEntityMap());
      // await this.aidStore.updateAidName(this.id(), value);
      // await this.aidStore.updateSelectedAidName(this.id(), value); // ? Pass the id to make sure it hasn't changed?
      await this.aidStore.updateSelectedAidName(value);
    }

    console.log(this.settingsStore.schedulerSettings());

    // this.settingsStore.updateTimeSettings({ timePickerInterval: '31m' });
  }

  private async updateAidAvailability(availability: Array<ScheduleTime>): Promise<void> {
    console.log('update aid availability');
    // await this.aidStore.updateAidAvailability(this.id(), availability); // ? Pass the id to make sure it hasn't changed?
    await this.aidStore.updateSelectedAidAvailability(availability);
  }
}
