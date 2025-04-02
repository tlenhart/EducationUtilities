import { NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/settings/settings.service';
import { FormattedNumberTableConfig, FormattedNumberValue } from '../../models';
import {
  configureTableHeaderValues,
  configureTableValues,
  formattedSequentialHeaderNumberGenerator,
  setItemClassesAndColors,
  setItemClassesAndColorsForHeader
} from '../../utils/number-utils';
import { isGlobalSettingEnabled, isSettingEnabledAndTrue } from '../../utils/setting.utils';
import { NumberGridCellComponent } from '../number-grid-cell/number-grid-cell.component';

@Component({
  selector: 'app-number-grid',
  imports: [
    NgStyle,
    FormsModule,
    NumberGridCellComponent,
  ],
  templateUrl: './number-grid.component.html',
  styleUrl: './number-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberGridComponent {
  /* Injected Dependencies */
  private readonly settingsService: SettingsService = inject(SettingsService);

  /* Input Signals */
  public readonly gridConfig: InputSignal<FormattedNumberTableConfig> = input.required<FormattedNumberTableConfig>();

  /* Output Signals */
  public readonly updateIndividualValue: OutputEmitterRef<{ index: number, value: FormattedNumberValue }> = output<{ index: number, value: FormattedNumberValue }>();

  /* Signals */
  public readonly showHideTooltip = computed<boolean>(() => {
    const settings = this.settingsService.settings();
    return isGlobalSettingEnabled(settings.tooltips) && isSettingEnabledAndTrue(settings.tooltips.showHideTableCell);
  });

  /* Computed Signals */
  public readonly oneDimensionalValues: Signal<Array<FormattedNumberValue>> = computed(() => {
    const config = this.gridConfig();
    return Array.from(configureTableValues(config, setItemClassesAndColors));
  });
  public readonly rowHeaders: Signal<Array<FormattedNumberValue>> = computed(() => {
    const config: FormattedNumberTableConfig = {
      ...this.gridConfig(),
      values: Array
        .from(formattedSequentialHeaderNumberGenerator(1, this.gridConfig().columns, 1)),
    };

    return Array.from(configureTableHeaderValues(config, 'row', setItemClassesAndColorsForHeader));
  });
  public readonly columnHeaders: Signal<Array<FormattedNumberValue>> = computed(() => {
    const config: FormattedNumberTableConfig = {
      ...this.gridConfig(),

      values: Array
        .from(formattedSequentialHeaderNumberGenerator(1, this.gridConfig().columns, 1)),
    };

    return Array.from(configureTableHeaderValues(config, 'column', setItemClassesAndColorsForHeader));
  });

  public gridContainerStyles: Signal<Record<string, string>> = computed(() => {
    const config = this.gridConfig();

    return {
      'grid-template-columns': config.showRowHeaders
        ? `[header-column-start] 1fr [header-column-end] repeat(${config.columns}, 1fr)`
        : `repeat(${config.columns}, 1fr)`,
    };
  });

  public showHideAllCells(value: FormattedNumberValue): void {
    this.setCheckedForAllItems(this.oneDimensionalValues(), value.checked ?? false);
  }

  public valueUpdated(index: number, value: FormattedNumberValue): void {
    this.updateIndividualValue.emit({ index, value });
  }

  public headerValueUpdated(index: number, value: FormattedNumberValue, headerType: 'row' | 'column'): void {
    // Find the elements in the row/column and set their checked status.
    const items: Array<FormattedNumberValue> = this.oneDimensionalValues();
    switch (headerType) {
      case 'row': {
        const start = index * this.gridConfig().columns;
        const end = start + this.gridConfig().columns;

        // Update the checked element for each of the properties in the row.
        for (let i = start; i < end; i++) {
          this.setCheckedStatusForElement(i, items, value.checked);
        }

        break;
      }
      case 'column': {
        const length: number = this.rowHeaders().length;

        // Update the checked element for each of the properties in the column.
        for (let i = 0; i < length; i++) {
          const elementIndex: number = index + (i * length);
          this.setCheckedStatusForElement(elementIndex, items, value.checked);
        }

        break;
      }
    }
  }

  private setCheckedStatusForElement(index: number, items: Array<FormattedNumberValue>, checked: boolean | undefined): void {
    // Set each element to a new element so we don't get any ChangedAfterChecked errors.
    // If individual values, instead of the object, are passed into app-number-grid-cell, we don't need to reassign the object,
    //  and can instead just update the value in the existing object.
    items[index] = {
      ...this.oneDimensionalValues()[index],
      checked: checked,
    };
  }

  private setCheckedForAllItems(items: Array<FormattedNumberValue>, checked: boolean): void {
    for (let i = 0; i < items.length; i++) {
      this.setCheckedStatusForElement(i, items, checked);

      // As a possible performance improvement, use the following instead,
      //  and pass in the individual values (like checked) directly to number-grid-cell, instead of the full object,
      //  to ensure value updates actually trigger updates in the component. (Like the tooltip message.)
      // items[i].checked = checked;
    }
  }
}
