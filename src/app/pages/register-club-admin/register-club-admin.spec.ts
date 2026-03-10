import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterClubAdmin } from './register-club-admin';

describe('RegisterClubAdmin', () => {
  let component: RegisterClubAdmin;
  let fixture: ComponentFixture<RegisterClubAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterClubAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterClubAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
