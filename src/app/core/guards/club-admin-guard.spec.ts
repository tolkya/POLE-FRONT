import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { clubAdminGuard } from './club-admin-guard';

describe('clubAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => clubAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
