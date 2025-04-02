import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { showRightPaneResolver } from './show-right-pane.resolver';

describe('showRightPaneResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => showRightPaneResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
