import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { DEFAULT_SETTINGS, GlobalSettings, SavedData, Versioned } from '../../models';
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
  }

  public save(updatedSettings: GlobalSettings): boolean {
    const versioned: Versioned<GlobalSettings> = { ...updatedSettings, version: this.currentSettings().version };
    const saveSuccess: boolean = this.saveService.save<Versioned<GlobalSettings>>({ value: versioned, name: this.saveName });

    if (saveSuccess) {
      this.currentSettings.set(versioned);
    }

    return saveSuccess;
  }

  public resetSettings(): void {
    this.save({
      ...JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
    });
  }
}
