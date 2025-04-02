import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { NgStyle, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  model,
  ModelSignal,
  OnDestroy,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { signalMethod } from '@ngrx/signals';
import { distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'eu-entity-selector',
  imports: [
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSuffix,
    TitleCasePipe,
    ReactiveFormsModule,
    MatTooltip,
    NgStyle,
  ],
  templateUrl: './entity-selector.component.html',
  styleUrl: './entity-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// export class EntitySelectorComponent<T extends { id: EntityId | null }> implements OnDestroy {
// export class EntitySelectorComponent<T extends { id: EntityId | null } & Record<string, any>> implements OnDestroy {
export class EntitySelectorComponent<T extends Record<string, any>> implements OnDestroy {
  /* Injected Services */
  private readonly fb: FormBuilder = inject(FormBuilder);

  /* Inputs */
  public readonly entityType: InputSignal<string> = input.required<string>();
  public readonly entities: InputSignal<Array<T>> = input.required<Array<T>>();
  public readonly entityDisplayPropertyKey: InputSignal<keyof T> = input.required<keyof T>();
  public readonly entitySelectorFormControlWidth: InputSignal<string> = input<string>('min(17rem, 80%)');
  public readonly showValueAfterSelection: InputSignalWithTransform<boolean, string | boolean> = input<boolean, string | boolean>(false, {
    transform: (value: string | boolean) => coerceBooleanProperty(value),
  });
  public readonly showAddButton: InputSignalWithTransform<boolean, string | boolean> = input<boolean, string | boolean>(false, {
    transform: (value: string | boolean) => coerceBooleanProperty(value),
  });

  /* Outputs */
  public readonly addNewEntity: OutputEmitterRef<void> = output();

  public readonly selectedEntity: ModelSignal<T | null> = model<T | null>(null);

  public readonly filterEntityInput: Signal<ElementRef<HTMLInputElement>> = viewChild.required('filterEntityInput');

  /* Computed properties */
  public readonly possibleEntities: Signal<Array<T>> = computed(() => {
    return this.entities().slice();
  });

  public readonly filteredEntities: Signal<Array<T>> = computed(() => {
    const filter = this.filterValue().toLowerCase();

    return this.possibleEntities().filter((option: T) => {
      // return option.name.toLowerCase().includes(filter);
      // return option?.name.toLowerCase().includes(filter) ?? false;
      // TODO: Do this a different way that doesn't involve stringifying the object.
      if (!option) {
        return false;
      }

      return JSON.stringify(option).toLowerCase().includes(filter);
    });
  });

  public readonly displayFn = computed(() => {
    const displayProperty = this.entityDisplayPropertyKey();
    const showValueAfterSelection = this.showValueAfterSelection();

    if (showValueAfterSelection) {
      // Class properties are unavailable when Angular Material executes this display function, so we need to update the function whenever the entityDisplayPropertyKey updates.
      return (value: T | null): string => value?.[displayProperty] && typeof value[displayProperty] === 'string' ? value[displayProperty] : '';
    } else {
      return null;
    }
  });

  public readonly entitySelectorFormControl: FormControl<T | null>;

  private readonly changesAfterSelectedEntityChanged = signalMethod((changedEntity: T | null) => {
    if (this.showValueAfterSelection() && changedEntity && changedEntity !== this.entitySelectorFormControl.value) {
      this.entitySelectorFormControl.setValue(changedEntity, { onlySelf: true, emitEvent: false });
    } else if (!this.showValueAfterSelection()) {
      this.entitySelectorFormControl.reset();
    }
  });

  private readonly filterValue: WritableSignal<string> = signal('');
  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    this.entitySelectorFormControl = this.fb.control({
      value: null,
      disabled: false,
    }, { updateOn: 'change' });

    this.subscriptions.add(this.entitySelectorFormControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe({
        next: (value) => {
          // console.log('value changed', value);
          if (value && typeof value !== 'string') {
            this.setEntity(value);
          }
        }
      }));

    this.changesAfterSelectedEntityChanged(this.selectedEntity);
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public setEntity(entity: T): void {
    this.selectedEntity.set(entity);
  }

  public filter(): void {
    const filterValue = this.filterEntityInput().nativeElement.value.toLowerCase();
    this.filterValue.set(filterValue);
  }

  public clear(event: MouseEvent): void {
    // TODO: May need some adjustments here.

    event.preventDefault();
    event.stopPropagation();

    this.filterEntityInput().nativeElement.focus();
    this.entitySelectorFormControl.reset();
    this.filterValue.set('');
  }
}
