import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentActionsComponent } from './document-actions.component';

describe('DocumentActionsComponent', () => {
  let component: DocumentActionsComponent;
  let fixture: ComponentFixture<DocumentActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
      imports: [DocumentActionsComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DocumentActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
