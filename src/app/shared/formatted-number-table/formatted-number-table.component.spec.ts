import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormattedNumberTableComponent } from './formatted-number-table.component';

describe('FormattedNumberTableComponent', () => {
  let component: FormattedNumberTableComponent;
  let fixture: ComponentFixture<FormattedNumberTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormattedNumberTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormattedNumberTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
