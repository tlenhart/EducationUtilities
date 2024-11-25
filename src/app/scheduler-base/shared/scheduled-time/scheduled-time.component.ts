import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { ScheduleTime } from '../../models/schedule-time.model';

@Component({
  selector: 'eu-scheduled-time',
  standalone: true,
  imports: [],
  templateUrl: './scheduled-time.component.html',
  styleUrl: './scheduled-time.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduledTimeComponent {

  public scheduledTimeForm: FormGroup<{ [K in keyof ScheduleTime ]: FormControl }>;

  /* Injected Dependencies. */
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  constructor() {
    this.scheduledTimeForm = this.fb.group({
      startTime: this.fb.control(''),
      endTime: this.fb.control(''),
      days: this.fb.control(''),
    });
  }
}
