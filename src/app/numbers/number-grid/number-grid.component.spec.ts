import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberGridComponent } from './number-grid.component';

describe('NumberGridComponent', () => {
  let component: NumberGridComponent;
  let fixture: ComponentFixture<NumberGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [NumberGridComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(NumberGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
