import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  InputSignal,
  InputSignalWithTransform,
  output,
  OutputEmitterRef,
  Signal,
  TemplateRef,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { BtnType } from '../../models/html-utility.types';

@Component({
  selector: 'eu-button-with-icon',
  imports: [
    MatButton,
    NgTemplateOutlet,
    NgStyle,
  ],
  templateUrl: './button-with-icon.component.html',
  styleUrl: './button-with-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonWithIconComponent {
  public readonly btnText: InputSignal<string> = input.required<string>();
  public readonly btnType: InputSignal<BtnType> = input<BtnType>('button');
  public readonly btnClass: InputSignal<string> = input<string>('');
  public readonly btnColor: InputSignal<string | undefined> = input<string | undefined>();
  public readonly flatButton: InputSignal<boolean> = input<boolean>(false);
  public readonly ariaLabel: InputSignal<string | null> = input<string | null>(null);
  public readonly iconPosition: InputSignal<'left' | 'right'> = input<'left' | 'right'>('right');
  public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
    transform: (value: BooleanInput) => {
      return coerceBooleanProperty(value);
    },
  });
  public readonly showIcon: InputSignalWithTransform<boolean, BooleanInput> = input.required<boolean, BooleanInput>({
    transform: (value: BooleanInput) => {
      return coerceBooleanProperty(value);
    },
  });

  public readonly btnIcon: Signal<TemplateRef<unknown>> = contentChild.required('btnIcon');

  /* eslint-disable @typescript-eslint/no-invalid-void-type */
  public readonly btnClicked: OutputEmitterRef<void> = output<void>();
  /* eslint-enable @typescript-eslint/no-invalid-void-type */

  public btnClick(): void {
    this.btnClicked.emit();
  }
}
