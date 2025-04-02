import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateTimeFormatSettingsComponent } from './date-time-format-settings.component';

describe('DateTimeFormatSettingsComponent', () => {
  let component: DateTimeFormatSettingsComponent;
  let fixture: ComponentFixture<DateTimeFormatSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [DateTimeFormatSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateTimeFormatSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
