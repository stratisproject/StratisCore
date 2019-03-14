import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseUnitComponent } from './base-unit.component';

describe('BaseUnitComponent', () => {
  let component: BaseUnitComponent;
  let fixture: ComponentFixture<BaseUnitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseUnitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
