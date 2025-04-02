import { ChangeDetectionStrategy, Component, input, InputSignal, Signal, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { FormGroupOf } from '../../../../models/forms.types';
import { ObservationBehavior } from '../../../../models/observation.model';
import { InsertDbType } from '../../../../scheduler-base/models/db.types';
import { ButtonWithIconComponent } from '../../../../shared/button-with-icon/button-with-icon.component';
import { randomColor } from '../../../../utils/color.utils';

@Component({
  selector: 'eu-observation-behavior-configuration-form',
  imports: [
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatIcon,
    MatTooltip,
    MatIconButton,
    ButtonWithIconComponent,
  ],
  templateUrl: './observation-behavior-configuration-form.component.html',
  styleUrl: './observation-behavior-configuration-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObservationBehaviorConfigurationFormComponent {

  public readonly observationBehaviorForm: InputSignal<
    FormGroup<FormGroupOf<ObservationBehavior>>
    | FormGroup<FormGroupOf<InsertDbType<ObservationBehavior>>>
  > = input.required();

  public readonly previewButtonDisclaimerText: Signal<string> = signal('This preview may not be an accurate representation of the button during use. Button size and data may change. The color should remain consistent.');

  public randomizeButtonColor(): void {
    this.observationBehaviorForm().controls.color?.setValue(randomColor());
  }
}
