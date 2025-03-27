import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentObservationSessionsComponent } from './student-observation-sessions.component';

describe('StudentObservationSessionsComponent', () => {
  let component: StudentObservationSessionsComponent;
  let fixture: ComponentFixture<StudentObservationSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [StudentObservationSessionsComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(StudentObservationSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
