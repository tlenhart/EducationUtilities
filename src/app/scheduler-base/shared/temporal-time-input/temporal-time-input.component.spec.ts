import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemporalTimeInputComponent } from './temporal-time-input.component';

describe('TemporalTimeInputComponent', () => {
  let component: TemporalTimeInputComponent;
  let fixture: ComponentFixture<TemporalTimeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [TemporalTimeInputComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TemporalTimeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
