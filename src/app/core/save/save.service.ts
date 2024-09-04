import { Injectable } from '@angular/core';
import { SaveData, SavedData } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  public save<T>(saveData: SaveData<T>): boolean {
    try {
      localStorage.setItem(saveData.name, JSON.stringify(saveData.value));
      return true;
    } catch (e) {
      console.error('Unable to save configuration.', 'Export instead.', e);
      return false;
    }
  }

  public load<T>(name: string): SavedData<T> {
    const value: string | null = localStorage.getItem(name);

    return {
      data: value ? JSON.parse(value) : null,
      success: !!value,
    };
  }
}

