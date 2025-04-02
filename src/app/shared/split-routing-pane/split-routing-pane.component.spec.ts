import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitRoutingPaneComponent } from './split-routing-pane.component';

describe('SplitRoutingPaneComponent', () => {
  let component: SplitRoutingPaneComponent;
  let fixture: ComponentFixture<SplitRoutingPaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [SplitRoutingPaneComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SplitRoutingPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
