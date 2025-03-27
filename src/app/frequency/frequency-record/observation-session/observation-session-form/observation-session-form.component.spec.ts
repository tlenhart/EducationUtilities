import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationSessionFormComponent } from './observation-session-form.component';

describe('ObservationSessionFormComponent', () => {
  let component: ObservationSessionFormComponent;
  let fixture: ComponentFixture<ObservationSessionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [ObservationSessionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ObservationSessionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
