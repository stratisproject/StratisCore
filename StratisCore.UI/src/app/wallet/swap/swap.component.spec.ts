import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwapComponent } from './swap.component';

describe('SwapComponent', () => {
  let component: SwapComponent;
  let fixture: ComponentFixture<SwapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
