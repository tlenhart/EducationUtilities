import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleConfigBaseComponent } from './schedule-config-base.component';

describe('ScheduleConfigBaseComponent', () => {
  let component: ScheduleConfigBaseComponent;
  let fixture: ComponentFixture<ScheduleConfigBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [ScheduleConfigBaseComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ScheduleConfigBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
