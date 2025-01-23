import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  signal,
  Signal,
  viewChild,
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
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelContent,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { SaveService } from '../../core/save/save.service';
import { NUMBER_TABLE_DEFAULT_CONFIGS } from '../../defaults/number-table-default-configs';
import { FormattedNumberTableConfig, FormattedNumberValue } from '../../models';
import { NumberFormConfig, NumberFormForm } from '../../models/forms.types';
import { DocumentActionsComponent } from '../../shared/document-actions/document-actions.component';
import { buildColorsArray } from '../../utils/color.utils';
import { arrayToArrayOfFormControls } from '../../utils/form.utils';
import { formattedSequentialNumberGenerator } from '../../utils/number-utils';
import { isNotValueValidator, numberTableConfigValidator, VALIDATION_ERROR_KEYS } from '../../validators';
import { NumberGridComponent } from '../number-grid/number-grid.component';
import {
  RandomizeHiddenElementsComponent
} from '../shared/randomize-hidden-elements/randomize-hidden-elements.component';

@Component({
  selector: 'app-numbers-table',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggle,
    DocumentActionsComponent,
    NumberGridComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelContent,
    RandomizeHiddenElementsComponent,
  ],
  templateUrl: './numbers-table.component.html',
  styleUrl: './numbers-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumbersTableComponent implements OnDestroy {
  public readonly numbers: Signal<Array<FormattedNumberValue>> = computed(() => {
    return this.buildNumbersArray(this.currentConfig());
  });

  public readonly currentConfig: WritableSignal<NumberFormConfig> = signal<NumberFormConfig>(NUMBER_TABLE_DEFAULT_CONFIGS[0]);

  public readonly tableConfig: WritableSignal<FormattedNumberTableConfig> = signal<FormattedNumberTableConfig>(
    FormattedNumberTableConfig.fromNumberFormConfig(
      this.currentConfig(),
      this.numbers(),
    ));

  public readonly randomizeHiddenItems: Signal<RandomizeHiddenElementsComponent | undefined> = viewChild(RandomizeHiddenElementsComponent);

  public readonly errorKeys = VALIDATION_ERROR_KEYS;
  public readonly numberTableConfigForm: FormGroup<NumberFormForm>;
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly saveService: SaveService = inject(SaveService);
  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    effect(() => {
      this.tableConfig.set(FormattedNumberTableConfig.fromNumberFormConfig(
        this.currentConfig(),
        this.buildNumbersArray(this.currentConfig()),
      ));
    }, { allowSignalWrites: true });

    this.numberTableConfigForm = this.fb.group<NumberFormForm>({
      start: this.fb.control(this.currentConfig().start), // new FormControl(0, { nonNullable: true }),
      end: this.fb.control(this.currentConfig().end), // new FormControl(0, { nonNullable: true }),
      // eslint-disable-next-line @typescript-eslint/unbound-method
      countBy: this.fb.control(this.currentConfig().countBy, { validators: [Validators.required, isNotValueValidator(0)] }), // new FormControl(0, { nonNullable: true }),
      columns: this.fb.control(this.currentConfig().columns, { validators: [Validators.min(1)] }), // TODO: Look into other Validators options to try and avoid the full import.
      colors: this.fb.array(
        arrayToArrayOfFormControls(this.currentConfig().colors, this.fb)
      ),
      showBackgroundColors: this.fb.control(this.currentConfig().showBackgroundColors),
      showHiddenValues: this.fb.control(false),
    }, { validators: [numberTableConfigValidator()] });

    this.subscriptions.add(this.numberTableConfigForm.valueChanges.pipe(
      // distinctUntilChanged(),
    ).subscribe((updatedValue: Partial<NumberFormConfig>) => {
      if (this.numberTableConfigForm.valid) {
        this.currentConfig.set(updatedValue as NumberFormConfig);
      }
    }));

    // When the number of columns changes, update the number of colors.
    this.subscriptions.add(this.numberTableConfigForm.controls.columns.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(200),
    ).subscribe((updatedColumnCount: number) => {
      this.updateColors(updatedColumnCount);
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public print(): void {
  }

  public save(): void {
    this.saveService.save({
      name: this.currentConfig().name ?? '100s data',
      value: {
        values: this.numbers(),
        config: this.currentConfig(),
      },
    });
  }

  public downloadPdf(): void {
    // console.log(pdfmake); // TODO: May not need @types.
  }

  public resetConfig(): void {
    this.currentConfig.set(NUMBER_TABLE_DEFAULT_CONFIGS[0]);

    this.numberTableConfigForm.reset();
    this.randomizeHiddenItems()?.reset();
  }

  public updateHiddenRandomValues(values: Array<FormattedNumberValue>): void {
    this.tableConfig.update((current: FormattedNumberTableConfig): FormattedNumberTableConfig => {
      return { ...current, values: values };
    });
  }

  private buildNumbersArray(config: NumberFormConfig): Array<FormattedNumberValue> {
    // TODO: Error Checking.
    // TODO: start should be <= end. end not being even divisible by countBy. countBy !== 0
    // TODO: Just return if the config leads to an invalid table.
    return Array.from(formattedSequentialNumberGenerator(config.start, config.end, config.countBy));
  }

  private updateColors(updatedColumnCount: number): void {
    const config = this.currentConfig();

    // Update the list of colors and propagate those changes.
    this.currentConfig.update((currentValue: NumberFormConfig) => {
      currentValue.colors = buildColorsArray(updatedColumnCount, config.colors);
      return currentValue;
    });

    const currentColorControls: FormArray<FormControl<string>> = this.numberTableConfigForm.controls.colors;
    const columnCount: number = this.currentConfig().columns;
    if (currentColorControls.length > columnCount) {
      // Count backwards so the removals and the array index can remain consistent.
      for (let i = this.numberTableConfigForm.controls.colors.length - 1; i >= columnCount; i--) {
        this.numberTableConfigForm.controls.colors.removeAt(i);
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
