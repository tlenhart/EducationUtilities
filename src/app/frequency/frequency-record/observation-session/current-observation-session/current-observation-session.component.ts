import { ChangeDetectionStrategy, Component, inject, input, InputSignalWithTransform } from '@angular/core';
import { IdImportType } from '../../../../models/route-parameter.model';
import { CurrentObservationSessionStore } from '../../../../shared/stores/current-observation-session.store';
import { ObservationSessionFormComponent } from '../observation-session-form/observation-session-form.component';

@Component({
  selector: 'eu-current-observation-session',
  imports: [
    ObservationSessionFormComponent,
  ],
  templateUrl: './current-observation-session.component.html',
  styleUrl: './current-observation-session.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentObservationSessionComponent {
  public observationSessionId: InputSignalWithTransform<number, IdImportType> = input.required<number, IdImportType>({
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

  public readonly currentObservationSessionStore = inject(CurrentObservationSessionStore);
}
