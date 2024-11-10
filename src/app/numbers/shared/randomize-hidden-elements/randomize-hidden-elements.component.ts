import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  OnDestroy,
  output,
  OutputEmitterRef
} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { FormattedNumberTableConfig, FormattedNumberValue } from '../../../models';

@Component({
  selector: 'eu-randomize-hidden-elements',
  standalone: true,
  imports: [
    MatButton,
    MatFormField,
    MatHint,
    MatIcon,
    MatInput,
    MatError,
    MatLabel,
    MatTooltip,
    ReactiveFormsModule,
  ],
  templateUrl: './randomize-hidden-elements.component.html',
  styleUrl: './randomize-hidden-elements.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RandomizeHiddenElementsComponent implements OnDestroy {
  /* Inputs */
  public readonly tableConfig: InputSignal<FormattedNumberTableConfig | undefined> = input<FormattedNumberTableConfig>();

  /* Outputs */
  public readonly updateTableValues: OutputEmitterRef<Array<FormattedNumberValue>> = output();

  /* Form controls */
  public readonly randomElementsFormControl: FormControl<number | null | undefined>;

  /* Injected dependencies */

  /* Workers */
  private readonly worker?: Worker;
  private readonly useWorkerFallback: boolean = false;

  constructor() {
    const fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
    this.randomElementsFormControl = fb.control(
      { value: null, disabled: false },
      { asyncValidators: [this.validateMaxRandomElements()] });

    // Set up worker.
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('../modify-random-elements-in-array.worker', import.meta.url), { type: 'module' });
      this.worker.onmessage = ({ data }: MessageEvent<Array<FormattedNumberValue>>) => {
        this.updateTableValues.emit(data);
      };
    } else {
      // Web Workers are not supported in this environment.
      this.useWorkerFallback = true;
    }
  }

  public ngOnDestroy(): void {
    this.worker?.terminate();
  }

  public reset(): void {
    this.randomElementsFormControl.reset();
  }

  public showHideRandomValues(numberOfRandomElements: number | string | null | undefined): void {
    const values = this.tableConfig()?.values;
    if (!Array.isArray(values)) {
      return;
    }

    if (!this.useWorkerFallback) {
      this.worker?.postMessage({ values: values, count: numberOfRandomElements ?? '' });
    }
  }

  private validateMaxRandomElements(): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors | null> => {
      const count = this.tableConfig()?.values.length;

      if (!count && count !== 0) {
        return Promise.resolve(null);
      }

      const numRandomElements: number | undefined = control.value as (number | undefined);

      let result: { max: string } | null = null;
      if ((numRandomElements ?? 0) > count) {
        result = { max: 'Number of random elements should be less than the number of items in the table.' };
      }

      return Promise.resolve(result);
    };
  }
}
