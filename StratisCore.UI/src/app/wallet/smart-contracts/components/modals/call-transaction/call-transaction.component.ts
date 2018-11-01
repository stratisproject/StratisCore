import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-call-transaction',
    templateUrl: './call-transaction.component.html',
    styleUrls: ['./call-transaction.component.css']
})
export class CallTransactionComponent implements OnInit {

    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit() {
    }

    closeClicked() {
        this.activeModal.close();
    }

}
