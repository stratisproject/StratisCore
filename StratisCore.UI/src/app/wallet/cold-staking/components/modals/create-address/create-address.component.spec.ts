import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAddressComponent } from './create-address.component';

describe('CreateAddressComponent', () => {
  let component: CreateAddressComponent;
  let fixture: ComponentFixture<CreateAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
