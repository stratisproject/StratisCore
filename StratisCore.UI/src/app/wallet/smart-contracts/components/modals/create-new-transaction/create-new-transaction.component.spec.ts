import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewTransactionComponent } from './create-new-transaction.component';

describe('CreateNewTransactionComponent', () => {
  let component: CreateNewTransactionComponent;
  let fixture: ComponentFixture<CreateNewTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
