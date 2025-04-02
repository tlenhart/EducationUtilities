import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, computed, inject, model, ModelSignal, Signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import {
  MatChipGrid,
  MatChipInput,
  MatChipInputEvent,
  MatChipListbox,
  MatChipOption,
  MatChipRemove,
  MatChipRow,
  MatChipSelectionChange,
} from '@angular/material/chips';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { BehaviorId, ObservationBehavior } from '../../../models/observation.model';
import { PersonId } from '../../../scheduler-base/models/person-type.model';
import { ObservationBehaviorStore } from '../../../shared/stores/observation-behavior.store';
import { StudentStore } from '../../../shared/stores/student.store';

@Component({
  selector: 'eu-student-behavior-configuration',
  imports: [
    MatFormField,
    MatChipGrid,
    MatChipRow,
    MatChipRemove,
    MatIcon,
    FormsModule,
    MatChipInput,
    MatAutocomplete,
    MatLabel,
    MatOption,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatChipListbox,
    MatChipOption,
  ],
  templateUrl: './student-behavior-configuration.component.html',
  styleUrl: './student-behavior-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentBehaviorConfigurationComponent {
  public readonly studentStore = inject(StudentStore);
  public readonly behaviorStore = inject(ObservationBehaviorStore);

  public readonly separatorKeyCodes: ReadonlyArray<number> = [ENTER, COMMA];

  public readonly selectedBehaviors: Signal<Set<BehaviorId>> = computed(() => {
    const configurationEntity = this.studentStore.configurationEntity();
    return new Set(configurationEntity?.behaviors ?? []);
  });

  public readonly unselectedBehaviors: Signal<Array<ObservationBehavior>> = computed(() => {
    const selected = this.selectedBehaviors();

    return this.behaviorStore.sortedBehaviors().filter((behavior) => {
      return !selected.has(behavior.id);
    });
  });

  public readonly currentFilterValue: ModelSignal<string> = model('');
  public readonly filteredBehaviors = computed(() => {
    const current = this.currentFilterValue().toLocaleLowerCase();

    return current
      ? this.unselectedBehaviors().filter((behavior) => behavior.behavior.toLocaleLowerCase().includes(current))
      : this.unselectedBehaviors().slice();
  });

  public async changeBehaviorAssignment(event: MatChipSelectionChange): Promise<void> {
    const entityId = this.studentStore.configurationEntityId();

    if (event.selected && event.isUserInput && entityId && !this.studentStore.configurationEntity()?.behaviors.includes(event.source.value as number)) {
      await this.studentStore.addBehavior(entityId, event.source.value as number);
    } else if (entityId && event.isUserInput && this.studentStore.configurationEntity()?.behaviors.includes(event.source.value as number)) {
      await this.studentStore.removeBehavior(entityId, event.source.value as number);
    }
  }

  public async addBehavior(event: MatChipInputEvent): Promise<void> {
    const value = this.behaviorStore.sortedBehaviors().find(x => x.behavior.toLocaleLowerCase() === event.value.trim());
    if (value) {
      await this.addValueToStudent(this.studentStore.configurationEntityId(), value.id);
    }
  }

  public async selectBehavior(event: MatAutocompleteSelectedEvent): Promise<void> {
    const entityId: PersonId | null = this.studentStore.configurationEntityId();

    if (!entityId || !event.option.value || !this.behaviorStore.entityMap()[event.option.value as number]) {
      return;
    }

    event.option.deselect();
    await this.addValueToStudent(entityId, event.option.value as number);
  }

  public async removeBehavior(behaviorId: BehaviorId): Promise<void> {
    const configurationEntityId: PersonId | null = this.studentStore.configurationEntityId();

    if (!configurationEntityId) {
      return;
    }

    await this.studentStore.removeBehavior(configurationEntityId, behaviorId);
  }

  private async addValueToStudent(studentId: PersonId | null, behaviorId: BehaviorId): Promise<void> {
    this.currentFilterValue.set(''); // TODO: Maybe call this sooner.

    if (!studentId) {
      return;
    }

    await this.studentStore.addBehavior(studentId, behaviorId);
  }
}
