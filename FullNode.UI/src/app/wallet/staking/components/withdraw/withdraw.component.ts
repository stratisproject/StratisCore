import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-withdraw',
    templateUrl: './withdraw.component.html',
    styleUrls: ['./withdraw.component.css']
})
export class StakingWithdrawComponent implements OnInit {

    constructor(private activeModal: NgbActiveModal) { }

    ngOnInit() {
    }

    onCloseClicked() {
        this.activeModal.close();
    }

}
