import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerBaseComponent } from './scheduler-base.component';

describe('SchedulerBaseComponent', () => {
  let component: SchedulerBaseComponent;
  let fixture: ComponentFixture<SchedulerBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [SchedulerBaseComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SchedulerBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
