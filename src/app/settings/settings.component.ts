import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { AgentType } from 'clippy.modern';
import { SettingsService } from '../core/settings/settings.service';
import { ClippySettings, GlobalSettingFormGroup, GlobalSettings, TooltipSettings, Versioned } from '../models';
import { buildFormControlDefaults, buildIndividualFormControlData } from '../utils/form.utils';
import { DateTimeFormatSettingsComponent } from './date-time-format-settings/date-time-format-settings.component';

type ClippySettingsFormValues = { [J in keyof GlobalSettingFormGroup<ClippySettings>]: ClippySettings[J]['value'] };
type TooltipSettingsFormValues = { [J in keyof GlobalSettingFormGroup<TooltipSettings>]: TooltipSettings[J]['value'] };

@Component({
  selector: 'app-settings',
  imports: [
    ReactiveFormsModule,
    MatCheckbox,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatButton,
    MatSlideToggle,
    DateTimeFormatSettingsComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  public readonly settings: Signal<Versioned<GlobalSettings>>;
  public readonly settingsForm: Signal<FormGroup<{ [K in keyof GlobalSettings]: FormGroup }>>;

  private readonly settingsService: SettingsService = inject(SettingsService);
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  constructor() {
    this.settings = this.settingsService.settings;

    this.settingsForm = computed(() => {
      const settingsValue = this.settings();

      return this.fb.group<{ [K in keyof GlobalSettings]: FormGroup }>({
        // Pick<GlobalSettingValue, 'userEnabledGroup'>
        // clippy: this.fb.group<{ [K in keyof GlobalSettingFormGroup<ClippySettings>]: FormControl<GlobalSettingFormGroup<ClippySettings>[K]['value']> }>({
        clippy: this.fb.group<{ [K in keyof GlobalSettingFormGroup<ClippySettings>]: FormControl<ClippySettings[K]['value']> }>({
          userEnabledGroup: this.fb.control<boolean>(buildIndividualFormControlData(settingsValue.clippy.userEnabledGroup)),
          selectedAgent: this.fb.control<AgentType>(buildFormControlDefaults(settingsValue.clippy.selectedAgent, settingsValue.clippy)),
          playRandomAnimations: this.fb.control<boolean>(buildFormControlDefaults(settingsValue.clippy.playRandomAnimations, settingsValue.clippy)),
          playSounds: this.fb.control<boolean>(buildFormControlDefaults(settingsValue.clippy.playSounds, settingsValue.clippy)),
        }),
        tooltips: this.fb.group<{ [K in keyof GlobalSettingFormGroup<TooltipSettings>]: FormControl<TooltipSettings[K]['value']> }>({
          userEnabledGroup: this.fb.control<boolean>(buildIndividualFormControlData(settingsValue.tooltips.userEnabledGroup)),
          showHideTableCell: this.fb.control<boolean>(buildFormControlDefaults(settingsValue.tooltips.showHideTableCell, settingsValue.tooltips)),
        }),
      });
    });
  }

  public save(): void {
    const clippyRawValue: ClippySettingsFormValues = this.settingsForm().controls.clippy.getRawValue() as ClippySettingsFormValues;
    const tooltipsRawValue: TooltipSettingsFormValues = this.settingsForm().controls.tooltips.getRawValue() as TooltipSettingsFormValues;

    // TODO: Modify this so that only the changed settings are saved.
    //  You don't want to save all settings as if they aren't migrated at all, new settings will be lost.
    this.settingsService.save({
      clippy: {
        ...this.settings().clippy,
        userEnabledGroup: {
          ...this.settings().clippy.userEnabledGroup,
          value: clippyRawValue.userEnabledGroup,
        },
        selectedAgent: {
          ...this.settings().clippy.selectedAgent,
          value: clippyRawValue.selectedAgent,
        },
        playSounds: {
          ...this.settings().clippy.playSounds,
          value: clippyRawValue.playSounds,
        },
        playRandomAnimations: {
          ...this.settings().clippy.playRandomAnimations,
          value: clippyRawValue.playRandomAnimations,
        },
      } as ClippySettings, // as GlobalSettingFormGroup<ClippySettings> as ClippySettings, // Exclude<GlobalSettingContainer<ClippySettings>, Exclude<GlobalSettingValue, 'userEnabledGroup'>>,
      tooltips: {
        ...this.settings().tooltips,
        userEnabledGroup: {
          ...this.settings().tooltips.userEnabledGroup,
          value: tooltipsRawValue.userEnabledGroup,
        },
        showHideTableCell: {
          ...this.settings().tooltips.showHideTableCell,
          value: tooltipsRawValue.showHideTableCell,
        },
      } as TooltipSettings,
    });
  }

  public resetSettings(): void {
    this.settingsService.resetSettings();
  }
}
