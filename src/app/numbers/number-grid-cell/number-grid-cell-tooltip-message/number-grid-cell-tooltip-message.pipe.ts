import { Pipe, PipeTransform } from '@angular/core';
import { FormattedNumberValue } from '../../../models';

@Pipe({
  name: 'numberGridCellTooltipMessage',
  standalone: true,
  pure: true,
})
export class NumberGridCellTooltipMessagePipe implements PipeTransform {

  public transform(value: FormattedNumberValue, checked: boolean | undefined, showTooltips: boolean): string {
    // If settings can ever be set while a cell is visible, make sure showTooltips changing/not changing works properly when value changes.
    if (!showTooltips) {
      return '';
    }

    let message: string = '';
    let type: 'row' | 'column' | '' = '';

    // ! Do not use value.checked for anything. If value isn't replaced, checked won't be updated.
    if (value.header) {
      message = 'Show/Hide the entire row/column';
      const combinedClasslist: string =
        typeof value.classList === 'string'
          ? value.classList
          : (value.classList?.join(' ') ?? '');

      if (combinedClasslist.includes('row-header')) {
        type = 'row';
      } else if (combinedClasslist.includes('column-header')) {
        type = 'column';
      }

      message = `When checked, all items in this ${type}, except for the header, will be hidden when printing (unless overridden).`;
    } else {
      message = `When checked, this cell value will be hidden when printing. Currently ${(checked ? 'hidden' : 'visible')}.`;
    }

    return message;
  }

}
