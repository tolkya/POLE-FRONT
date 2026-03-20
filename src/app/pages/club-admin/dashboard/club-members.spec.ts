import { TestBed } from '@angular/core/testing';

import { ClubMembers } from './club-members';

describe('ClubMembers', () => {
  let service: ClubMembers;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClubMembers);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
