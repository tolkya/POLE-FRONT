import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubTable } from './club-table';

describe('ClubTable', () => {
  let component: ClubTable;
  let fixture: ComponentFixture<ClubTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
