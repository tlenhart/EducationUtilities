import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddObservationBehaviorDialogComponent } from './add-observation-behavior-dialog.component';

describe('AddObservationBehaviorDialogComponent', () => {
  let component: AddObservationBehaviorDialogComponent;
  let fixture: ComponentFixture<AddObservationBehaviorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [AddObservationBehaviorDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddObservationBehaviorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
