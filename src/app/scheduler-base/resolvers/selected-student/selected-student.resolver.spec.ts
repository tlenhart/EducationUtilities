import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { selectedStudentResolver } from './selected-student.resolver';

describe('selectedStudentResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => selectedStudentResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
