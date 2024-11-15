import { TestBed } from '@angular/core/testing';

import { AppSidenavService } from './app-sidenav.service';

describe('AppSidenavServiceService', () => {
  let service: AppSidenavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppSidenavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
