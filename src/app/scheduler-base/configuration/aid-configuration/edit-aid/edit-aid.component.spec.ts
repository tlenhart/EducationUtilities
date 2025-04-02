import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAidComponent } from './edit-aid.component';

describe('EditAidComponent', () => {
  let component: EditAidComponent;
  let fixture: ComponentFixture<EditAidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [EditAidComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EditAidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
