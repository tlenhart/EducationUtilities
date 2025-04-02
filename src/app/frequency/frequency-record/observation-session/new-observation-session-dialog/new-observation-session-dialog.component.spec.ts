import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewObservationSessionDialogComponent } from './new-observation-session-dialog.component';

describe('NewObservationSessionDialogComponent', () => {
  let component: NewObservationSessionDialogComponent;
  let fixture: ComponentFixture<NewObservationSessionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [NewObservationSessionDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewObservationSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
