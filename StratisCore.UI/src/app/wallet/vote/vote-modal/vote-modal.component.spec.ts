import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteModalComponent } from './vote-modal.component';

describe('VoteModalComponent', () => {
  let component: VoteModalComponent;
  let fixture: ComponentFixture<VoteModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
