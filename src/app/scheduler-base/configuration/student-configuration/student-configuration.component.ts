import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'eu-student-configuration',
  standalone: true,
  imports: [],
  templateUrl: './student-configuration.component.html',
  styleUrl: './student-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentConfigurationComponent {

}
