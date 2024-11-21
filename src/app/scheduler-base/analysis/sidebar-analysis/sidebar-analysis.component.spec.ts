import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarAnalysisComponent } from './sidebar-analysis.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('SidebarAnalysisComponent', () => {
  let component: SidebarAnalysisComponent;
  let fixture: ComponentFixture<SidebarAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [SidebarAnalysisComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SidebarAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
