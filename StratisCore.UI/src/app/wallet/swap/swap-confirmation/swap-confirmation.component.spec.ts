import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapConfirmationComponent } from './swap-confirmation.component';

describe('SwapConfirmationComponent', () => {
  let component: SwapConfirmationComponent;
  let fixture: ComponentFixture<SwapConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwapConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
