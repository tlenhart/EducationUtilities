import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumbersTableComponent } from './numbers-table.component';

describe('NumbersTableComponent', () => {
  let component: NumbersTableComponent;
  let fixture: ComponentFixture<NumbersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumbersTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NumbersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
