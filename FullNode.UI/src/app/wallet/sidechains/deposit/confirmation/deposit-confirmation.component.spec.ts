import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositConfirmationComponent } from './deposit-confirmation.component';

describe('DepositConfirmationComponent', () => {
  let component: DepositConfirmationComponent;
  let fixture: ComponentFixture<DepositConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepositConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
