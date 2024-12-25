import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Aid } from '../../models/aid.model';
import { Person } from '../../models/person-type.model';

import { PersonSelectorComponent } from './person-selector.component';

describe('PersonSelectorComponent', () => {
  let component: PersonSelectorComponent;
  let fixture: ComponentFixture<PersonSelectorComponent<Person>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [PersonSelectorComponent]
    })
      .compileComponents();

    // TODO: Change generic type for additional Person types.
    fixture = TestBed.createComponent(PersonSelectorComponent<Aid>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
