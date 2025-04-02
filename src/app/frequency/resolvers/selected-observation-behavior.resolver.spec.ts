import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { selectedObservationBehaviorResolver } from './selected-observation-behavior.resolver';

describe('selectedObservationBehaviorResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => selectedObservationBehaviorResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
