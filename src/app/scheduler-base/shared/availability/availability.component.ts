import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { ScheduleTime } from '../../models/schedule-time.model';

type AvailabilityFormType = FormGroup<{ [K in keyof ScheduleTime]: FormControl }>;

@Component({
  selector: 'eu-availability',
  standalone: true,
  imports: [],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityComponent {
  // public readonly availabilityForm: FormArray<AvailabilityFormType>;

  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  constructor() {
    // this.availabilityForm = this.fb.array([
    //   this.fb.group({
    //     startTime: this.fb.control(''),
    //     endTime: this.fb.control(''),
    //
    //   })
    // ]);
  }
}
