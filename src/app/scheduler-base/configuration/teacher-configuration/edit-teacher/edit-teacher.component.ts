import { ChangeDetectionStrategy, Component, effect, inject, input, InputSignalWithTransform, OnDestroy, OnInit } from '@angular/core';
import { TeacherStore } from '../../../stores/teacher.store';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { EntityId } from '@ngrx/signals/entities';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { IdImportType } from '../../../../models/route-parameter.model';

@Component({
  selector: 'eu-edit-teacher',
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-teacher.component.html',
  styleUrl: './edit-teacher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTeacherComponent implements OnInit, OnDestroy {
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

  public readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  public readonly teacherStore = inject(TeacherStore);

  public readonly teacherName: FormControl<string>;

  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    console.log('constructor');

    this.teacherName = this.fb.control(this.teacherStore.selectedEntity()?.name ?? '');

    effect(() => {
      const entity = this.teacherStore.selectedEntity();
      if (entity?.id === this.id()) {
        this.teacherName.setValue(entity?.name ?? '');
      }
    });

    this.subscriptions.add(this.teacherName.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
    ).subscribe((newName: string) => {
      const id = this.teacherStore.selectedEntityId();

      if (id) {
        this.updateName(id, newName);
      }
    }));
  }

  public ngOnInit(): void {
    console.log('ngOnInit');
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateName(id: EntityId, newName: string): void {
    this.teacherStore.updateTeacher(id, { name: newName });
  }
}
