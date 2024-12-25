import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { scheduleIdResolver } from './schedule-id.resolver';

describe('scheduleIdResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => scheduleIdResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
