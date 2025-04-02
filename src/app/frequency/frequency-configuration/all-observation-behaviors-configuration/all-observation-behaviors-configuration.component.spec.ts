import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllObservationBehaviorsConfigurationComponent } from './all-observation-behaviors-configuration.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('AllObservationBehaviorsConfigurationComponent', () => {
  let component: AllObservationBehaviorsConfigurationComponent;
  let fixture: ComponentFixture<AllObservationBehaviorsConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [AllObservationBehaviorsConfigurationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AllObservationBehaviorsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
