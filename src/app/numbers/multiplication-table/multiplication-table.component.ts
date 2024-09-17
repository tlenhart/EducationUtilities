import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatOption } from '@angular/material/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelContent,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { combineLatest, debounceTime, distinctUntilChanged, startWith, Subscription } from 'rxjs';
import { MULTIPLICATION_TABLE_DEFAULT_CONFIGS } from '../../defaults/number-table-default-configs';
import { FormattedNumberTableConfig, FormattedNumberValue } from '../../models';
import {
  ColorAlignmentOptions,
  MultiplicationFormConfig,
  MultiplicationTableConfigForm
} from '../../models/forms.types';
import { DocumentActionsComponent } from '../../shared/document-actions/document-actions.component';
import { buildColorsArray } from '../../utils/color.utils';
import { arrayToArrayOfFormControls } from '../../utils/form-utils';
import { multiplicationTableNumberGenerator } from '../../utils/number-utils';
import { NumberGridComponent } from '../number-grid/number-grid.component';

@Component({
  selector: 'app-multiplication-table',
  standalone: true,
  imports: [
    DocumentActionsComponent,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatSlideToggle,
    MatCheckbox,
    NumberGridComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelContent,
    MatOption,
    MatSelect,
  ],
  templateUrl: './multiplication-table.component.html',
  styleUrl: './multiplication-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiplicationTableComponent implements OnDestroy {
  public readonly alignColorsByOptions: ReadonlyArray<ColorAlignmentOptions> = ['both', 'column', 'row'];
  public readonly multiplicationTableConfigForm: FormGroup<MultiplicationTableConfigForm>;
  public readonly currentConfig: WritableSignal<MultiplicationFormConfig> = signal<MultiplicationFormConfig>(MULTIPLICATION_TABLE_DEFAULT_CONFIGS[0]);

  /**
   * The configuration passed to app-number-grid to display the table.
   * @type {Signal<FormattedNumberTableConfig>}
   */
  public readonly tableConfig: Signal<FormattedNumberTableConfig> = computed(() => {
    return FormattedNumberTableConfig.fromMultiplicationFormConfig(
      this.currentConfig(),
      this.buildNumbersArray(this.currentConfig()),
    );
  });

  private readonly subscriptions: Subscription = new Subscription();

  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  constructor() {
    // TODO: Don't forget to add any validators from the other numbers table component.
    this.multiplicationTableConfigForm = this.fb.group<MultiplicationTableConfigForm>({
      start: this.fb.control({ value: this.currentConfig().start, disabled: true }, { validators: [Validators.required, Validators.min(1)] }),
      end: this.fb.control(this.currentConfig().end, { validators: [Validators.required, Validators.min(1)] }),
      alignColorsBy: this.fb.control(this.currentConfig().alignColorsBy),
      // columns: this.fb.control(this.currentConfig().columns), // TODO: Disable? But only if it doesn't interfere with retrieving values...
      showColumnHeaders: this.fb.control(this.currentConfig().showColumnHeaders),
      showRowHeaders: this.fb.control(this.currentConfig().showRowHeaders),
      colors: this.fb.array(
        arrayToArrayOfFormControls(this.currentConfig().colors, this.fb)
      ),
      showBackgroundColors: this.fb.control(this.currentConfig().showBackgroundColors),
      showHiddenValues: this.fb.control(this.currentConfig().showHiddenValues),
    });

    this.subscriptions.add(this.multiplicationTableConfigForm.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(250), // TODO: Consider taking this out.
    ).subscribe((updatedValue: Partial<MultiplicationFormConfig>) => {
      if (this.multiplicationTableConfigForm.valid) {
        // Use getRawValue() for the form group if more values than just `start` are disabled.
        // The start control is currently disabled, so we don't receive its value here and need to manually set it.
        updatedValue.start = this.multiplicationTableConfigForm.controls.start.getRawValue();
        this.currentConfig.set(updatedValue as MultiplicationFormConfig);
      }
    }));

    // When the number of columns changes, update the number of colors.
    this.subscriptions.add(combineLatest([
      // startWith is added to trigger when end is first changed, but start has not yet been changed.
      this.multiplicationTableConfigForm.controls.start.valueChanges.pipe(startWith(1)),
      this.multiplicationTableConfigForm.controls.end.valueChanges,
    ]).pipe(
      distinctUntilChanged(),
      debounceTime(200),
    ).subscribe(([start, end]) => {
      this.updateColors(end - start + 1);
    }));

    this.subscriptions.add(this.multiplicationTableConfigForm.controls.showBackgroundColors.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe((showBackgroundColors: boolean) => {
      // Enable/Disable the align colors by dropdown when colors are enabled/disabled.
      if (!showBackgroundColors) {
        this.multiplicationTableConfigForm.controls.alignColorsBy.disable({ onlySelf: true, emitEvent: false });
      } else {
        this.multiplicationTableConfigForm.controls.alignColorsBy.enable({ onlySelf: true, emitEvent: false });
      }
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public print(): void {
  }

  public downloadPdf(): void {
  }

  public save(): void {
  }

  public reset(): void {
    this.currentConfig.set(MULTIPLICATION_TABLE_DEFAULT_CONFIGS[0]);

    // this.setTableValue();
    this.multiplicationTableConfigForm.reset(); // Instead?
  }

  private buildNumbersArray(config: MultiplicationFormConfig): Array<FormattedNumberValue> {
    return Array.from(multiplicationTableNumberGenerator(config.start, config.end));
  }

  private setTableValue(): void {
    const formConfig = {
      ...this.currentConfig(),
    } as Partial<MultiplicationFormConfig>;
    delete formConfig.name; // Remove since it is not currently settable in the UI.
    delete formConfig.columns; // Remove since it is not currently settable in the UI.

    this.multiplicationTableConfigForm.setValue(formConfig as MultiplicationFormConfig);
  }

  private updateColors(updatedColumnCount: number): void {
    const config = this.currentConfig();

    // Update the list of colors and propagate those changes.
    this.currentConfig.update((currentValue: MultiplicationFormConfig) => {
      currentValue.colors = buildColorsArray(updatedColumnCount, config.colors);
      return currentValue;
    });

    const currentColorControls: FormArray<FormControl<string>> = this.multiplicationTableConfigForm.controls.colors;
    const columnCount: number = this.currentConfig().colors.length;
    if (currentColorControls.length > columnCount) {
      // Count backwards so the removals and array index can remain consistent.
      for (let i = this.multiplicationTableConfigForm.controls.colors.length - 1; i >= columnCount; i--) {
        this.multiplicationTableConfigForm.controls.colors.removeAt(i);
      }
    } else if (currentColorControls.length < columnCount) {
      // Generate the form controls for any colors that do not yet have form controls.
      const newControls = arrayToArrayOfFormControls(
        this.currentConfig().colors.slice(currentColorControls.length, columnCount),
        this.fb);

      for (const newControl of newControls) {
        currentColorControls.push(newControl);
      }
    }
  }
}
