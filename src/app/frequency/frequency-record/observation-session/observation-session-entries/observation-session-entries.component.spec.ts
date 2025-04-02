import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationSessionEntriesComponent } from './observation-session-entries.component';

describe('ObservationSessionEntriesComponent', () => {
  let component: ObservationSessionEntriesComponent;
  let fixture: ComponentFixture<ObservationSessionEntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [ObservationSessionEntriesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ObservationSessionEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
