import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStudentDialogComponent } from './add-student-dialog.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('AddStudentDialogComponent', () => {
  let component: AddStudentDialogComponent;
  let fixture: ComponentFixture<AddStudentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [AddStudentDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddStudentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
