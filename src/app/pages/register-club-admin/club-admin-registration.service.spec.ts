import { TestBed } from '@angular/core/testing';

import { ClubAdminRegistration } from './club-admin-registration';

describe('ClubAdminRegistration', () => {
  let service: ClubAdminRegistration;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClubAdminRegistration);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
