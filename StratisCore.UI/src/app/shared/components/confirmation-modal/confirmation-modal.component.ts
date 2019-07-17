import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {

  @Input() public title = 'Confirmation';
  @Input() public body = 'Are you sure you want to do this?';

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
  }

}
