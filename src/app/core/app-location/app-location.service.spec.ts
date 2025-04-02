import { TestBed } from '@angular/core/testing';

import { AppLocationService } from './app-location.service';

describe('AppLocationService', () => {
  let service: AppLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
