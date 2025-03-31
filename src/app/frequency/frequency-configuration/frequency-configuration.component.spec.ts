import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyConfigurationComponent } from './frequency-configuration.component';

describe('FrequencyConfigurationComponent', () => {
  let component: FrequencyConfigurationComponent;
  let fixture: ComponentFixture<FrequencyConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [FrequencyConfigurationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FrequencyConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
