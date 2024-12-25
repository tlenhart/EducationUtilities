import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { selectedAidResolver } from './selected-aid.resolver';

describe('selectedAidResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => selectedAidResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
