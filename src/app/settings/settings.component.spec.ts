import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [SettingsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
