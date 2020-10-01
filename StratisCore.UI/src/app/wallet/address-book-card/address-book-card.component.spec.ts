import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressBookCardComponent } from './address-book-card.component';

describe('AddressBookCardComponent', () => {
  let component: AddressBookCardComponent;
  let fixture: ComponentFixture<AddressBookCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressBookCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressBookCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
