import { TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignal,
  OnDestroy,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { Person, PersonType } from '../../models/person-type.model';

@Component({
  selector: 'eu-person-selector',
  imports: [
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    TitleCasePipe,
    MatIcon,
    MatSuffix,
    MatIconButton,
  ],
  templateUrl: './person-selector.component.html',
  styleUrl: './person-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonSelectorComponent<T = Person> implements OnDestroy {
  public readonly personType: InputSignal<PersonType> = input.required<PersonType>();
  public readonly people: InputSignal<Array<Person>> = input.required<Array<Person>>();

  public readonly filterNameInput: Signal<ElementRef<HTMLInputElement>> = viewChild.required('filterNameInput');

  public selectedPerson: OutputEmitterRef<T | Person | null> = output<T | null>();

  /* Computed properties */
  public readonly possiblePeople: Signal<Array<Person>> = computed(() => {
    return this.people().slice();
  });

  public readonly filteredPeople: Signal<Array<Person>> = computed(() => {
    // TODO: Consider using the store(s) instead.
    const filter = this.filterValue().toLowerCase();

    return this.possiblePeople().filter((option: Person) => {
      return option.name.toLowerCase().includes(filter);
    });
  });

  public readonly personSelectorFormControl: FormControl<Person | string | null>;

  private readonly filterValue: WritableSignal<string> = signal('');
  private readonly subscriptions: Subscription = new Subscription();

  /* Stores */
  // private readonly teacherStore = inject(TeacherStore);
  // private readonly aidStore = inject(AidStore);
  // private readonly studentStore = inject(StudentStore);

  /* Injected Services */
  private readonly fb: FormBuilder = inject(FormBuilder);

  constructor() {
    this.personSelectorFormControl = this.fb.control({
      value: null,
      disabled: false,
    }, { updateOn: 'change' });

    this.subscriptions.add(this.personSelectorFormControl.valueChanges.subscribe({
      next: (value) => {
        if (typeof value !== 'string' && value) {
          this.setPerson(value);
        }
      }
    }));
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public setPerson(person: Person): void {
    // const actualPersonType = getActualPersonType();
    this.selectedPerson.emit(person);
  }

  public filter(): void {
    const filterValue = this.filterNameInput().nativeElement.value.toLowerCase();
    this.filterValue.set(filterValue);
  }

  public displayPersonName(person: Person | null): string {
    return person?.name ? person.name : '';
  }

  public clear(event: MouseEvent): void {
    // TODO: May need some adjustments here.

    event.preventDefault();
    event.stopPropagation();

    this.filterNameInput().nativeElement.focus();
    this.personSelectorFormControl.reset();
    this.filterValue.set('');
  }
}
