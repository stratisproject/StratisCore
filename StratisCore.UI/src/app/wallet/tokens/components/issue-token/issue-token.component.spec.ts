import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueTokenComponent } from './issue-token.component';

describe('IssueTokenComponent', () => {
  let component: IssueTokenComponent;
  let fixture: ComponentFixture<IssueTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
