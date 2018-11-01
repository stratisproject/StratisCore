import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-create-new-transaction',
    templateUrl: './create-new-transaction.component.html',
    styleUrls: ['./create-new-transaction.component.css']
})
export class CreateNewTransactionComponent implements OnInit {

    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit() {
    }

    closeClicked() {
        this.activeModal.close();
    }

}
