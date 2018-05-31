import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawConfirmationComponent } from './withdraw-confirmation.component';

describe('WithdrawConfirmationComponent', () => {
  let component: WithdrawConfirmationComponent;
  let fixture: ComponentFixture<WithdrawConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
