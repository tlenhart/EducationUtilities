import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityEntryComponent } from './availability-entry.component';

describe('AvailabilityEntryComponent', () => {
  let component: AvailabilityEntryComponent;
  let fixture: ComponentFixture<AvailabilityEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [AvailabilityEntryComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AvailabilityEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
