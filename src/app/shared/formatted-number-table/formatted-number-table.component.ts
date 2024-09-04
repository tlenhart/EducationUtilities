import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatTooltip } from '@angular/material/tooltip';
import { FormattedNumberTableConfig, FormattedNumberValue } from '../../models';

@Component({
  selector: 'app-formatted-number-table',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    MatGridList,
    MatGridTile,
    MatTooltip,
  ],
  templateUrl: './formatted-number-table.component.html',
  styleUrl: './formatted-number-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormattedNumberTableComponent {
  public readonly tableConfig: InputSignal<FormattedNumberTableConfig> = input.required<FormattedNumberTableConfig>();
  public readonly updateIndividualValue: OutputEmitterRef<{ index: number, value: FormattedNumberValue }> = output<{ index: number, value: FormattedNumberValue }>();
  public readonly updateAllValues: OutputEmitterRef<Array<FormattedNumberValue>> = output<Array<FormattedNumberValue>>();

  public getTileClass(idx: number): Array<string> {
    // TODO: Try to find another way.
    // console.log('getTileClass');
    return ['column' + (idx % this.tableConfig().columns), 'row' + Math.floor(idx / this.tableConfig().columns)]
  }

  public valueUpdated(index: number, value: FormattedNumberValue): void {
    this.updateIndividualValue.emit({ index, value });
  }

  public pushUpdatedValues(): void {
    this.updateAllValues.emit(this.tableConfig().values);
  }
}
