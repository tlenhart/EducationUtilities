import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberGridCellComponent } from './number-grid-cell.component';

describe('NumberGridCellComponent', () => {
  let component: NumberGridCellComponent<number>;
  let fixture: ComponentFixture<NumberGridCellComponent<number>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [NumberGridCellComponent<number>],
    })
      .compileComponents();

    fixture = TestBed.createComponent(NumberGridCellComponent<number>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
