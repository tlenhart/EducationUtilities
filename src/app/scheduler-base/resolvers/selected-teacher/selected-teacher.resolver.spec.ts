import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { selectedTeacherResolver } from './selected-teacher.resolver';

describe('selectedTeacherResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => selectedTeacherResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
