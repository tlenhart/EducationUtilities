import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { SaveService } from '../../core/save/save.service';
import { NUMBER_TABLE_DEFAULT_CONFIGS } from '../../defaults/number-table-default-configs';
import { FormattedNumberTableConfig, FormattedNumberValue } from '../../models';
import { NumberFormConfig, NumberFormForm } from '../../models/forms.types';
import { FormattedNumberTableComponent } from '../../shared/formatted-number-table/formatted-number-table.component';
import { arrayToArrayOfFormControls } from '../../utils/form-utils';
import { formattedSequentialNumberGenerator, sequentialNumberGenerator } from '../../utils/number-utils';
import { isNotValueValidator, numberTableConfigValidator, VALIDATION_ERROR_KEYS } from '../../validators';

@Component({
  selector: 'app-numbers-table',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatGridList,
    MatGridTile,
    FormattedNumberTableComponent,
    MatButton,
    MatIcon,
    MatSlideToggle,
  ],
  templateUrl: './numbers-table.component.html',
  styleUrl: './numbers-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumbersTableComponent implements OnDestroy {
  public readonly numbers: Signal<Array<FormattedNumberValue>> = computed(() => {
    return this.buildNumbersArray(this.currentConfig());
  });
  public readonly numberTableConfigForm: FormGroup<NumberFormForm>;
  public readonly currentConfig: WritableSignal<NumberFormConfig> = signal<NumberFormConfig>(NUMBER_TABLE_DEFAULT_CONFIGS[0]);
  public readonly tableConfig: Signal<FormattedNumberTableConfig> = computed(() => {
    return FormattedNumberTableConfig.fromNumberFormConfig(
      this.currentConfig(),
      this.numbers(),
    );
  });
  public readonly errorKeys = VALIDATION_ERROR_KEYS;
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly saveService: SaveService = inject(SaveService);
  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    this.numberTableConfigForm = this.fb.group<NumberFormForm>({
      start: this.fb.control(this.currentConfig().start), // new FormControl(0, { nonNullable: true }),
      end: this.fb.control(this.currentConfig().end), // new FormControl(0, { nonNullable: true }),
      countBy: this.fb.control(this.currentConfig().countBy, { validators: [Validators.required, isNotValueValidator(0)] }), // new FormControl(0, { nonNullable: true }),
      columns: this.fb.control(this.currentConfig().columns, { validators: [Validators.min(1)] }), // TODO: Look into other Validators options to try and avoid the full import.
      colors: this.fb.array(
        arrayToArrayOfFormControls(this.currentConfig().colors, this.fb)
      ),
      showHiddenValues: this.fb.control(false),
    }, { validators: [numberTableConfigValidator()] });

    this.subscriptions.add(this.numberTableConfigForm.valueChanges.pipe(
      distinctUntilChanged(),
    ).subscribe((updatedValue: Partial<NumberFormConfig>) => {
      if (this.currentConfig().colors.length < (updatedValue.colors?.length ?? this.currentConfig().colors.length)) {
        // TODO: We might need a column config object so we don't have to iterate over things like this as much.
        //  Just read the config value instead.
      }

      if (this.numberTableConfigForm.valid) {
        this.currentConfig.set(updatedValue as NumberFormConfig);
      }
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getTileClass(idx: number): Array<string> {
    // TODO: Try to find another way.
    return ['column' + (idx % this.currentConfig().columns), 'row' + Math.floor(idx / this.currentConfig().columns)]
  }

  public updateNumberValue(value: { index: number, value: FormattedNumberValue }): void {
    console.log('update number value', value);
    // TODO: Fix this so numbers can actually be updated and contain a config here.
    // this.numbers()[value.index] = value.value;
  }

  public print(): void {
    window.print();
  }

  public save(): void {
    this.saveService.save({
      name: '100s data',
      value: {
        values: this.numbers(),
        config: this.currentConfig(),
      },
    });
  }

  public downloadPdf(): void {
    // console.log(pdfmake); // TODO: May not need @types.
  }

  private buildNumbersArray(config: NumberFormConfig): Array<FormattedNumberValue> {
    // TODO: Error Checking.
    // TODO: start should be <= end. end not being even divisible by countBy. countBy !== 0
    // TODO: Just return if the config leads to an invalid table.
    return Array.from(formattedSequentialNumberGenerator(config.start, config.end, config.countBy));
  }

  private buildNumberTable(config: NumberFormConfig): Array<Array<number>> {
    // TODO: This is potentially triggering too much. (For example, when an individual color is changing.)
    const computedArray: Array<Array<number>> = [];

    let trackedConfig = {
      ...config,
      end: config.start + config.columns - 1, // TODO: Maybe this will be problematic.
    };

    // TODO: ! Need to account for countBy!
    for (let i = 0; i < Math.ceil(config.end / config.columns); i++) {
      computedArray.push(
        Array.from(sequentialNumberGenerator(trackedConfig.start, trackedConfig.end, trackedConfig.countBy)),
      );

      let end = trackedConfig.end + trackedConfig.columns;
      if (end > config.end) {
        end = config.end;
      }

      trackedConfig = {
        ...trackedConfig,
        start: trackedConfig.start + trackedConfig.columns,
        end: end,
      };
    }

    console.log(computedArray);
    return computedArray;
  }
}
