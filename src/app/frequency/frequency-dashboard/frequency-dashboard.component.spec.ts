import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyDashboardComponent } from './frequency-dashboard.component';

describe('FrequencyDashboardComponent', () => {
  let component: FrequencyDashboardComponent;
  let fixture: ComponentFixture<FrequencyDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [FrequencyDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FrequencyDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
