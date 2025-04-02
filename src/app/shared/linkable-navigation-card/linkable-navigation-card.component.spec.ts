import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkableNavigationCardComponent } from './linkable-navigation-card.component';

describe('LinkableNavigationCardComponent', () => {
  let component: LinkableNavigationCardComponent;
  let fixture: ComponentFixture<LinkableNavigationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [LinkableNavigationCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkableNavigationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
