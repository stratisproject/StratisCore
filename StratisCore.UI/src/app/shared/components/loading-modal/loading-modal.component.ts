import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-loading-modal',
  templateUrl: './loading-modal.component.html',
  styleUrls: ['./loading-modal.component.css']
})
export class LoadingModalComponent implements OnInit, OnDestroy {

  @Input()
  loading = true;

  @Output()
  close = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  closeClicked() {
    this.close.emit();
  }
}
