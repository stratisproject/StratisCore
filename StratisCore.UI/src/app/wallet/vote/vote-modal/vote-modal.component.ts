import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-vote-modal',
  templateUrl: './vote-modal.component.html',
  styleUrls: ['./vote-modal.component.scss']
})
export class VoteModalComponent implements OnInit {
  @Input()
  loading = true;
  title;
  body;
  footer;

  @Output()
  close = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  closeClicked(): void {
    this.close.emit();
  }
}
