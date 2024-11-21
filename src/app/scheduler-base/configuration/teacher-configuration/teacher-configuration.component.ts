import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Person } from '../../models/person-type.model';
import { Teacher } from '../../models/teacher.model';
import { PersonSelectorComponent } from '../../shared/person-selector/person-selector.component';
import { TeacherStore } from '../../stores/teacher.store';

@Component({
  selector: 'eu-teacher-configuration',
  standalone: true,
  imports: [
    PersonSelectorComponent,
    RouterOutlet,
  ],
  templateUrl: './teacher-configuration.component.html',
  styleUrl: './teacher-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherConfigurationComponent {
  public readonly teacherStore = inject(TeacherStore);

  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  public async selectTeacher(teacher: Person | Teacher | null): Promise<void> {
    if (teacher) {
      await this.router.navigate([teacher.id], { relativeTo: this.route });
    }
  }
}
