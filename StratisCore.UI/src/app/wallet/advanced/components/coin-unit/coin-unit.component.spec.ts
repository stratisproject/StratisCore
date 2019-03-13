import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinUnitComponent } from './coin-unit.component';

describe('CoinUnitComponent', () => {
  let component: CoinUnitComponent;
  let fixture: ComponentFixture<CoinUnitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinUnitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
