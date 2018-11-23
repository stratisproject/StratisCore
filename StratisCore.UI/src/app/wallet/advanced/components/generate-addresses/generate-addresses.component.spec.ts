import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateAddressesComponent } from './generate-addresses.component';

describe('GenerateAddressesComponent', () => {
  let component: GenerateAddressesComponent;
  let fixture: ComponentFixture<GenerateAddressesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateAddressesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateAddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
