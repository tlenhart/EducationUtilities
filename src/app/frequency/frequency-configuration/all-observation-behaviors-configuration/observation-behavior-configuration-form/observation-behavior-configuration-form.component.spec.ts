import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationBehaviorConfigurationFormComponent } from './observation-behavior-configuration-form.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('ObservationBehaviorConfigurationFormComponent', () => {
  let component: ObservationBehaviorConfigurationFormComponent;
  let fixture: ComponentFixture<ObservationBehaviorConfigurationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [ObservationBehaviorConfigurationFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ObservationBehaviorConfigurationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
