import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationBehaviorConfigurationComponent } from './observation-behavior-configuration.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('ObservationBehaviorConfigurationComponent', () => {
  let component: ObservationBehaviorConfigurationComponent;
  let fixture: ComponentFixture<ObservationBehaviorConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [ObservationBehaviorConfigurationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ObservationBehaviorConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
