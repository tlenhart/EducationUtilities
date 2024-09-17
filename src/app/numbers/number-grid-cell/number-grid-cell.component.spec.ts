import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberGridCellComponent } from './number-grid-cell.component';

describe('NumberGridCellComponent', () => {
  let component: NumberGridCellComponent;
  let fixture: ComponentFixture<NumberGridCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [NumberGridCellComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(NumberGridCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
