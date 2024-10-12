import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import {
  DEFAULT_SETTINGS,
  GlobalSettings,
  SavedData,
  Version,
  Versioned
} from '../../models';
import { SaveService } from '../save/save.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public get settings(): Signal<Versioned<GlobalSettings>> {
    return this.currentSettings.asReadonly();
  };

  private readonly currentSettings: WritableSignal<Versioned<GlobalSettings>> = signal({ ...DEFAULT_SETTINGS });
  private readonly saveService: SaveService = inject(SaveService);
  private readonly saveName: string = 'GLOBAL_SETTINGS';

  constructor() {
    // Save a copy of the default settings.
    this.saveService.save<Versioned<GlobalSettings>>({ value: DEFAULT_SETTINGS, name: 'ORIGINAL_' + this.saveName });

    // Try loading saved settings.
    const loadedSettings: SavedData<Versioned<GlobalSettings>> = this.saveService.load<Versioned<GlobalSettings>>(this.saveName);

    if (loadedSettings.success) {
      this.currentSettings.set(loadedSettings.data!);
    } else {
      console.warn('Default settings were loaded!'); // TODO: Make sure to notify the user that default settings were loaded. (And try to always avoid this.)
      this.currentSettings.set({ ...DEFAULT_SETTINGS });
    }

    this.currentSettings.update((current: Versioned<GlobalSettings>) => {
      // Set the version in the settings object as a Version type, rather than a simple object.
      (current as { -readonly [K in keyof Versioned<GlobalSettings>]: Versioned<GlobalSettings>[K] }).version = new Version(current.version.major, current.version.minor, current.version.patch);
      return current;
    });

    // As a temporary measure, if a migration needs to be performed, reset all settings to their default instead of migrating.
    if (this.currentSettings().version.toString() !== DEFAULT_SETTINGS.version.toString()) {
      console.log('settings migration needed', this.currentSettings().version.toString(), DEFAULT_SETTINGS.version.toString());

      const migratedSettings = this.saveWithVersion(DEFAULT_SETTINGS, DEFAULT_SETTINGS.version);

      if (!migratedSettings) {
        console.warn('Unable to migrate settings. Please reset settings manually.');
      }
    }
  }

  public save(updatedSettings: GlobalSettings): boolean {
    return this.saveWithVersion(updatedSettings, this.currentSettings().version);
  }

  public resetSettings(): void {
    this.save({
      ...(JSON.parse(JSON.stringify(DEFAULT_SETTINGS))) as Versioned<GlobalSettings>,
    });
  }

  private saveWithVersion(updatedSettings: GlobalSettings, version: Version): boolean {
    const versioned: Versioned<GlobalSettings> = { ...updatedSettings, version: version };
    const saveSuccess: boolean = this.saveService.save<Versioned<GlobalSettings>>({ value: versioned, name: this.saveName });

    if (saveSuccess) {
      this.currentSettings.set(versioned);
    }

    return saveSuccess;
  }
}
