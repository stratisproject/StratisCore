import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Animations } from '@shared/animations/animations';
import { SnackbarService } from 'ngx-snackbar';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  animations: Animations.fadeIn
})
export class ConfirmationModalComponent implements OnInit {

  @Input() public title = 'Confirmation';
  @Input() public body = 'Are you sure you want to do this?';
  @Input() public confirmSnackBarMessage;

  constructor(
    private snackbarService: SnackbarService,
    public activeModal: NgbActiveModal) {
  }

  public ngOnInit(): void {
  }

  public onClick(value: boolean): void {
    if (value && this.confirmSnackBarMessage) {
      setTimeout(() => {
        this.snackbarService.add({
          msg: this.confirmSnackBarMessage,
          customClass: 'notify-snack-bar',
          action: {
            text: null
          }
        });
      },500);
    }

    this.activeModal.close(value);
  }


}
