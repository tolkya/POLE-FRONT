import { TestBed } from '@angular/core/testing';

import { UserClubs } from './user-clubs';

describe('UserClubs', () => {
  let service: UserClubs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserClubs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
