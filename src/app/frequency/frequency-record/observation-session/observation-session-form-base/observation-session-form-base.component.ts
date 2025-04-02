import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'eu-observation-session-form-base',
  imports: [
    RouterOutlet,
  ],
  templateUrl: './observation-session-form-base.component.html',
  styleUrl: './observation-session-form-base.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObservationSessionFormBaseComponent {

}
