import { AgentType } from 'clippy.modern';
import { Version, Versioned } from './version.model';

export interface GlobalSettingValue {
  /**
   * Whether or not the collection of settings is available to the user.
   *
   * This is a value the user should not be able to set.
   */
  settingGroupAvailable: boolean;

  /**
   * True when the user has enabled the entire section/group.
   *
   * False when the entire group is disabled.
   *
   * May not always be applicable, but is important for things like Clippy that we may not always want to load.
   */
  userEnabledGroup: SettingValue<boolean>;

  /**
   * A description to display in the ui for the specific setting group.
   */
  description: string;
}

export interface PossibleSettingValues<T> {
  /**
   * A list of possible values, when necessary for the setting, for a specific setting.
   */
  readonly possibleValues: ReadonlyArray<T>;
}

export interface SettingValue<T> {
  /**
   * The value for the setting.
   */
  value: T;

  /**
   * The default value for the setting.
   *
   * The user should not ever be able to set this value.
   */
  readonly defaultValue: T;

  /**
   * The setting description.
   */
  description: string;

  /**
   * If the user has access to/the ability to change the associated setting.
   */
  settingEnabled: boolean;
}

export type GlobalSettingFormGroup<T extends GlobalSettingValue> = Omit<T, Exclude<keyof GlobalSettingValue, 'userEnabledGroup'>>;

export interface TooltipSettings extends GlobalSettingValue {
  showHideTableCell: SettingValue<boolean>;
}

export interface ClippySettings extends GlobalSettingValue {
  playRandomAnimations: SettingValue<boolean>;
  playSounds: SettingValue<boolean>;
  selectedAgent: SettingValue<AgentType> & PossibleSettingValues<AgentType>;
}

export interface GlobalSettings {
  readonly tooltips: TooltipSettings;
  readonly clippy: ClippySettings;
}

export const DEFAULT_SETTINGS: Versioned<GlobalSettings> = {
  version: new Version(0, 0, 1),
  tooltips: {
    description: 'Settings for all tooltips in the application.',
    settingGroupAvailable: true,
    userEnabledGroup: {
      description: 'Enable all tooltips in the application.',
      value: false,
      defaultValue: false,
      settingEnabled: true,
    },
    showHideTableCell: {
      description: 'Show the tooltip when hovering over the checkbox used to show/hide values in a numbers table.',
      value: true,
      defaultValue: true,
      settingEnabled: true,
    },
  },
  clippy: {
    description: 'All settings for Clippy and Friends. Clippy and Friends can be disabled globally.',
    settingGroupAvailable: true,
    userEnabledGroup: {
      description: 'Enable Clippy and Friends.',
      value: true,
      defaultValue: false,
      settingEnabled: true,
    },
    playRandomAnimations: {
      settingEnabled: true,
      defaultValue: true,
      description: 'Randomly animate friend.',
      value: true,
    },
    playSounds: {
      settingEnabled: true,
      defaultValue: false,
      description: 'Play sounds (if available).',
      value: false,
    },
    selectedAgent: {
      settingEnabled: true,
      defaultValue: 'Clippy',
      value: 'Clippy',
      description: 'The friend to display/show.',
      possibleValues: [
        'Bonzi',
        'Clippy',
        'F1',
        'Genie',
        'Genius',
        'Links',
        'Merlin',
        'Peedy',
        'Rocky',
        'Rover',
      ],
    },
  },
};

// migrations.addMigration(new Version(0, 0, 2), (old) => {
//   return newSettings;
// });
