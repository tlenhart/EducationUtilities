import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitySelectorComponent } from './entity-selector.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { Student } from '../../scheduler-base/models/student.model';

describe('EntitySelectorComponent', () => {
  let component: EntitySelectorComponent<Student>;
  let fixture: ComponentFixture<EntitySelectorComponent<Student>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [EntitySelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EntitySelectorComponent<Student>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
