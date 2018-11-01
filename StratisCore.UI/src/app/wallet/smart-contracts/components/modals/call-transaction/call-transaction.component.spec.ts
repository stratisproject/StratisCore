import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallTransactionComponent } from './call-transaction.component';

describe('CallTransactionComponent', () => {
  let component: CallTransactionComponent;
  let fixture: ComponentFixture<CallTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
