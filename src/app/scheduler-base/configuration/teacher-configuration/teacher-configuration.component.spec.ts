import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherConfigurationComponent } from './teacher-configuration.component';

describe('TeacherConfigurationComponent', () => {
  let component: TeacherConfigurationComponent;
  let fixture: ComponentFixture<TeacherConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [TeacherConfigurationComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TeacherConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
