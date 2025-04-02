import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationSessionFormBaseComponent } from './observation-session-form-base.component';

describe('ObservationSessionFormBaseComponent', () => {
  let component: ObservationSessionFormBaseComponent;
  let fixture: ComponentFixture<ObservationSessionFormBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [ObservationSessionFormBaseComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ObservationSessionFormBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
