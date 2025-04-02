import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Person } from '../../models/person-type.model';
import { Teacher } from '../../models/teacher.model';
import { PersonSelectorComponent } from '../../shared/person-selector/person-selector.component';
import { ScheduleStore } from '../../stores/schedule.store';
import { TeacherStore } from '../../stores/teacher.store';

@Component({
  selector: 'eu-teacher-configuration',
  imports: [
    PersonSelectorComponent,
    RouterOutlet,
    MatIconButton,
    MatIcon,
    MatTooltip,
  ],
  templateUrl: './teacher-configuration.component.html',
  styleUrl: './teacher-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherConfigurationComponent {
  public readonly teacherStore = inject(TeacherStore);
  public readonly scheduleStore = inject(ScheduleStore);

  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  constructor() {
  }

  public async selectTeacher(teacher: Person | Teacher | null): Promise<void> {
    if (teacher) {
      try {
        await this.router.navigate([teacher.id], { relativeTo: this.route });
      } catch (error: unknown) {
        console.error('routing failure for teacher', error);
      }

    }
  }

  public async addTeacher(): Promise<void> {
    await this.teacherStore.addTeacher({
      scheduleId: this.scheduleStore.selectedEntityIdNumeric(),
      schedule: [],
      name: 'New Teacher',
      room: '',
    });
  }
}
