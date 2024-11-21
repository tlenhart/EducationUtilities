import { ChangeDetectionStrategy, Component, effect, inject, input, InputSignal, OnInit } from '@angular/core';
import { Teacher } from '../../../models/teacher.model';
import { TeacherStore } from '../../../stores/teacher.store';

@Component({
  selector: 'eu-edit-teacher',
  standalone: true,
  imports: [],
  templateUrl: './edit-teacher.component.html',
  styleUrl: './edit-teacher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTeacherComponent implements OnInit {
  public id: InputSignal<number> = input.required<number>();

  public readonly teacherStore = inject(TeacherStore);

  // public currentTeacher: Signal<Teacher> = this.teacherStore.teacherEntities()

  constructor() {
    // const test = this.teacherStore;
    console.log('constructor');
    // this.teacherStore.
    // console.log(this.teacherStore.teachers());

    effect(() => {
      console.log(this.id());
      console.log(this.teacherStore.teachers());

      // this.teacherStore.teachers();
    });
  }

  public ngOnInit(): void {
    console.log('ngOnInit');
    this.teacherStore.addTeacher({
      availability: [],
      homeroom: 'test',
      name: 'Teacher 1',
      id: 4,
    } as unknown as Teacher);

    this.teacherStore.updateTeacher(1, { name: 'Teacher 2' });
  }
}
