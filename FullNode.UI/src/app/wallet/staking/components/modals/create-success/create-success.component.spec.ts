import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSuccessComponent } from './create-success.component';

describe('CreateSuccessComponent', () => {
  let component: CreateSuccessComponent;
  let fixture: ComponentFixture<CreateSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
