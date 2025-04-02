import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyBaseComponent } from './frequency-base.component';

describe('FrequencyBaseComponent', () => {
  let component: FrequencyBaseComponent;
  let fixture: ComponentFixture<FrequencyBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [FrequencyBaseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FrequencyBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
