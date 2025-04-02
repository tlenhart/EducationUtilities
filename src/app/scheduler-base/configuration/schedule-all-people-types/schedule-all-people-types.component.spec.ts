import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleAllPeopleTypesComponent } from './schedule-all-people-types.component';

describe('ScheduleAllPeopleTypesComponent', () => {
  let component: ScheduleAllPeopleTypesComponent;
  let fixture: ComponentFixture<ScheduleAllPeopleTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [ScheduleAllPeopleTypesComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ScheduleAllPeopleTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
