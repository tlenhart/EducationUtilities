import { NgClass, NgFor, NgIf, NgStyle } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component, computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  Signal, WritableSignal
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatInputModule } from "@angular/material/input";
import { Subscription } from "rxjs";
import { fillArray, fillArrayFunction, sequentialNumberGenerator } from "../../utils/number-utils";

export interface NumberFormConfig {
  start: number;
  end: number;
  // range: { start: number; end: number };
  countBy: number;
  columns: number;
  colors: Array<string>;
}

export type NumberFormForm = {
  [K in keyof NumberFormConfig as Exclude<K, 'colors'>]: FormControl<NumberFormConfig[K]>;
} & {
  colors: FormArray<FormControl<string>>;
}

// const x: <NumberFormConfig, 'colors'> = {
//   colors
// }

@Component({
  selector: 'app-numbers-table',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatGridListModule,
    NgClass,
    NgStyle,
    NgIf,
    NgFor,
    // TODO: Remove if unused.
  ],
  templateUrl: './numbers-table.component.html',
  styleUrl: './numbers-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumbersTableComponent implements OnInit, OnDestroy {
  // public numbers: WritableSignal<Array<number>> = signal([]);
  public numbers: Signal<Array<number>> = computed(() => {
    return this.buildNumbersArray(this.currentConfig());
  });
  public groupedNumbers: Signal<Array<Array<number>>> = computed(() => {
    return this.buildNumberTable(this.currentConfig());
  })
  public numberTableConfigForm: FormGroup<NumberFormForm>;
  public currentConfig: WritableSignal<NumberFormConfig> = signal<NumberFormConfig>({ start: 1, end: 20, countBy: 1, columns: 10,
    colors: [],
  });
  private readonly fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly elementRef: ElementRef = inject(ElementRef);
  private readonly subscriptions: Subscription = new Subscription();
  // private readonly configChanged = computed(() => {
  //   // this.nu
  // });

  constructor() {
    this.buildNumbersArray(this.currentConfig());
    this.numberTableConfigForm = this.fb.group<NumberFormForm>({
      start: this.fb.control(1), // new FormControl(0, { nonNullable: true }),
      end: this.fb.control(20), // new FormControl(0, { nonNullable: true }),
      countBy: this.fb.control(1), // new FormControl(0, { nonNullable: true }),
      columns: this.fb.control(10, { validators: [Validators.min(1)] }), // TODO: Look into other Validators options to try and avoid the full import.
      colors: this.fb.array(
        this.buildColorsArray()
      ),
      // colors: this.fb.array(
      //   [this.fb.control('')],
      // ),
    });

    // const array = this.fb.array([
    //   this.fb.control<string>('test'),
    //   this.fb.control<string>('test2'),
    // ]);
    // console.log(array);

    // console.log(Array.from(fillArray('000000', 10)).map((value: string) => this.fb.control<string>(value)));

    this.subscriptions.add(this.numberTableConfigForm.valueChanges.subscribe((updatedValue: Partial<NumberFormConfig>) => {
      if (this.currentConfig().colors.length < (updatedValue.colors?.length ?? this.currentConfig().colors.length)) {
        // TODO: We might need a column config object so we don't have to iterate over things like this as much.
        //  Just read the config value instead.
      }
      this.currentConfig.set(updatedValue as NumberFormConfig);

      const colors = this.numberTableConfigForm.controls.colors.controls.map((val) => val.getRawValue());
      console.log(colors);


      // TODO: Do this a different way so you don't have to get dom elements this way.
      // TODO: Consider signal queries.
      // ! Stop using setTimeout!
      setTimeout(() => this.elementRef.nativeElement.querySelectorAll('.num-box')?.forEach((el: HTMLElement) => {
        // el.style.flexBasis = `calc(100% / ${updatedValue.columns + 1}`;
        // console.log(el);
      }), 20);
    }));
  }

  public ngOnInit(): void {
    console.log('test');
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getTileClass(idx: number): Array<string> {
    // TODO: Try to find another way.
    return ['column' + (idx % this.currentConfig().columns), 'row' + Math.floor(idx / this.currentConfig().columns)]
  }

  private buildColorsArray(): Array<FormControl<string>> {
    const colors = Array
      // .from(fillArray('000000', 10))
      .from(fillArrayFunction(() => `#${Math.floor(Math.random() * 100_000_0)}`, 10));
    colors.unshift(...['#FBE7C6', '#B4F8C8', '#A0E7E5', '#FFAEBC']); // Secondary.
    colors.unshift(...['#FBDFA0', '#FFC2C7', '#5DD9FB', '#BBD5D2']);
    colors.unshift(...['#D4BBDD', '#F6E6E8']);
    return colors.slice(0, 10).map((value: string) => this.fb.control<string>(value));
  }

  private buildNumbersArray(config: NumberFormConfig): Array<number> {
    // TODO: Error Checking.
    // TODO: start should be <= end. end not being even divisible by countBy. countBy !== 0
    // TODO: Just return if the config leads to an invalid table.
    return Array.from(sequentialNumberGenerator(config.start, config.end, config.countBy));
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
