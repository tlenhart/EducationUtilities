import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'eu-schedule-builder',
  standalone: true,
  imports: [],
  templateUrl: './schedule-builder.component.html',
  styleUrl: './schedule-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleBuilderComponent {

}
