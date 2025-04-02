import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentConfigurationComponent } from './student-configuration.component';

describe('StudentConfigurationComponent', () => {
  let component: StudentConfigurationComponent;
  let fixture: ComponentFixture<StudentConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [StudentConfigurationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
