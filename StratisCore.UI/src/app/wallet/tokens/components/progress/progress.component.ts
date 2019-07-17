import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css']
})
export class ProgressComponent implements OnInit, OnDestroy {

  @Input() loading = false;
  @Input() title;
  @Input() message;
  @Input() summary;
  @Output() close = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  closeClicked() {
    this.close.emit();
  }
}
