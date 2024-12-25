import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleCalendarDayComponent } from './schedule-calendar-day.component';

describe('ScheduleCalendarDayComponent', () => {
  let component: ScheduleCalendarDayComponent;
  let fixture: ComponentFixture<ScheduleCalendarDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [ScheduleCalendarDayComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ScheduleCalendarDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
