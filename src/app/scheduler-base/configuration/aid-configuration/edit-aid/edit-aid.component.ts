import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Aid } from '../../../models/aid.model';
import { AidStore } from '../../../stores/aid.store';

type IdImportType = number | string;

@Component({
  selector: 'eu-edit-aid',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    JsonPipe,
  ],
  templateUrl: './edit-aid.component.html',
  styleUrl: './edit-aid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAidComponent {
  public id: InputSignalWithTransform<number, IdImportType> = input.required<number, IdImportType>({
    transform: (value: IdImportType) => {
      if (typeof value !== 'number') {
        value = parseInt(value);
      }

      if (isNaN(value)) {
        value = -1;
      }

      return value;
    }
  });

  public readonly currentAid: Signal<Aid> = computed(() => this.aidStore.getAid(this.id()));

  public readonly aidStore = inject(AidStore);

  public async addAid(): Promise<void> {
    await this.aidStore.addAid({ name: `Name: ${Math.random().toFixed(7)}` });
  }

  public async updateAid(): Promise<void> {
  }

  public async updateAidName(value: string): Promise<void> {
    if (value) {
      console.log(this.aidStore.aidEntityMap());
      await this.aidStore.updateAid(this.id(), { name: value });
    }
  }
}
