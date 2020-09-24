import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-vote-modal',
  templateUrl: './vote-modal.component.html',
  styleUrls: ['./vote-modal.component.scss']
})
export class VoteModalComponent implements OnInit {
  @Input()
  loading = true;
  voteSuccess = false;
  voteFail = false;

  @Output()
  close = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  closeClicked(): void {
    this.close.emit();
  }
}
