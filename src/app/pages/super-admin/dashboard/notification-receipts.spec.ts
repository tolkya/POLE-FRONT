import { TestBed } from '@angular/core/testing';

import { NotificationReceipts } from './notification-receipts';

describe('NotificationReceipts', () => {
  let service: NotificationReceipts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationReceipts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
