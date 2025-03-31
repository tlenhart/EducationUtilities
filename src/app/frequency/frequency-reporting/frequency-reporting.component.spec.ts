import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyReportingComponent } from './frequency-reporting.component';

describe('FrequencyReportingComponent', () => {
  let component: FrequencyReportingComponent;
  let fixture: ComponentFixture<FrequencyReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [FrequencyReportingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FrequencyReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
