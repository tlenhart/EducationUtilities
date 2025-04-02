import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationSessionComponent } from './observation-session.component';

describe('ObservationSessionComponent', () => {
  let component: ObservationSessionComponent;
  let fixture: ComponentFixture<ObservationSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [ObservationSessionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ObservationSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
