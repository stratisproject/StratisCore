import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendTokenComponent } from './send-token.component';

describe('SendTokenComponent', () => {
  let component: SendTokenComponent;
  let fixture: ComponentFixture<SendTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
