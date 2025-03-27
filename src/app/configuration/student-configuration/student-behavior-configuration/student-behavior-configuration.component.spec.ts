import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentBehaviorConfigurationComponent } from './student-behavior-configuration.component';

describe('StudentBehaviorConfigurationComponent', () => {
  let component: StudentBehaviorConfigurationComponent;
  let fixture: ComponentFixture<StudentBehaviorConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [StudentBehaviorConfigurationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentBehaviorConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
