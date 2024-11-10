import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomizeHiddenElementsComponent } from './randomize-hidden-elements.component';

describe('RandomizeHiddenElementsComponent', () => {
  let component: RandomizeHiddenElementsComponent;
  let fixture: ComponentFixture<RandomizeHiddenElementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [RandomizeHiddenElementsComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(RandomizeHiddenElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
