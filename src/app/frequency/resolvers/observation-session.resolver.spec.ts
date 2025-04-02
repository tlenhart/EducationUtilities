import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { observationSessionResolver } from './observation-session.resolver';

describe('observationSessionResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => observationSessionResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
