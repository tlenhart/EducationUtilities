import { TestBed } from '@angular/core/testing';

import { GlobalUIService } from './global-ui.service';

describe('AppSidenavServiceService', () => {
  let service: GlobalUIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalUIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
