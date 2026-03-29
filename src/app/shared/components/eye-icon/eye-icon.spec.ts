import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EyeIcon } from './eye-icon';

describe('EyeIcon', () => {
  let component: EyeIcon;
  let fixture: ComponentFixture<EyeIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EyeIcon],
    }).compileComponents();

    fixture = TestBed.createComponent(EyeIcon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
