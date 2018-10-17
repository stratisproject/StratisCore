import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StakingOverviewComponent } from './overview.component';

describe('StakingOverviewComponent', () => {
  let component: StakingOverviewComponent;
  let fixture: ComponentFixture<StakingOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StakingOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
