import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockExplorerComponent } from './block-explorer.component';

describe('BlockExplorerComponent', () => {
  let component: BlockExplorerComponent;
  let fixture: ComponentFixture<BlockExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockExplorerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
