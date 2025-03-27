import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentObservationSessionComponent } from './current-observation-session.component';

describe('CurrentObservationSessionComponent', () => {
  let component: CurrentObservationSessionComponent;
  let fixture: ComponentFixture<CurrentObservationSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [CurrentObservationSessionComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CurrentObservationSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
