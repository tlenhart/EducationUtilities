import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  InputSignal,
  InputSignalWithTransform,
  output,
  OutputEmitterRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { FormattedNumberValue } from '../../models';
import {
  NumberGridCellTooltipMessagePipe
} from './number-grid-cell-tooltip-message/number-grid-cell-tooltip-message.pipe';

@Component({
  selector: 'app-number-grid-cell',
  standalone: true,
  imports: [
    FormsModule,
    NgClass,
    NgStyle,
    MatTooltip,
    NgTemplateOutlet,
    NumberGridCellTooltipMessagePipe,
  ],
  templateUrl: './number-grid-cell.component.html',
  styleUrl: './number-grid-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberGridCellComponent<T = number | string> {
  public readonly showHiddenValues: InputSignal<boolean> = input.required<boolean>();
  public readonly value: InputSignal<FormattedNumberValue> = input.required<FormattedNumberValue>();
  public readonly constValue: InputSignal<T> = input.required<T>();
  public readonly checked: InputSignalWithTransform<boolean, boolean | undefined> = input.required<boolean, boolean | undefined>({
    transform: (value: boolean | undefined) => !!value,
  });
  public readonly index: InputSignal<number> = input.required<number>();
  public readonly showTooltips: InputSignal<boolean> = input.required<boolean>();

  public readonly updateIndividualValue: OutputEmitterRef<{ index: number, value: FormattedNumberValue }> = output<{ index: number, value: FormattedNumberValue }>();

  public valueUpdated(index: number, value: FormattedNumberValue): void {
    this.updateIndividualValue.emit({ index, value });
  }
}
