import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-create-success',
    templateUrl: './create-success.component.html',
    styleUrls: ['./create-success.component.css']
})
export class ColdStakingCreateSuccessComponent {

    constructor(private activeModal: NgbActiveModal) { }

    okClicked() {
        this.activeModal.close();
    }
}
