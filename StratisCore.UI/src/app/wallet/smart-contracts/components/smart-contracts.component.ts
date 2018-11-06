import { Component, OnInit } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';
import { ClipboardService } from 'ngx-clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SmartContractsServiceBase } from '../smart-contracts.service';
import { GlobalService } from '../../../shared/services/global.service';
import { TransactionComponent, Mode } from './modals/transaction/transaction.component';

export class ContractItem {
    amountFormatted = '';
    constructor(public blockId: string, public type: string, public hash: string, public destinationAddress: string, private amount: number) {
        this.amountFormatted = amount.toLocaleString();
    }
}

@Component({
    selector: 'app-smart-contracts',
    templateUrl: './smart-contracts.component.html',
    styleUrls: ['./smart-contracts.component.css']
})
export class SmartContractsComponent implements OnInit {
    private walletName = '';
    addressString: string;
    addresses: string[];
    addressChangedSubject: Subject<string>;

    constructor(private globalService: GlobalService, private smartContractsService: SmartContractsServiceBase, private clipboardService: ClipboardService,
        private modalService: NgbModal) {
        this.addressChangedSubject = new Subject();
        this.walletName = this.globalService.getWalletName();
        this.smartContractsService
            .GetAddresses(this.walletName)
            .subscribe(addresses => {
                if (addresses && addresses.length > 0) {
                    this.addressChangedSubject.next(addresses[0]);
                    this.addresses = addresses;
                }
            });

        this.balance = this.addressChangedSubject
            .flatMap(x => this.smartContractsService.GetAddressBalance(x));
    }

    balance: Observable<number>;
    contracts: ContractItem[];

    ngOnInit() {
        this.smartContractsService.GetContracts(this.walletName).subscribe(x =>
            this.contracts = x.map(c => new ContractItem(c.blockId, c.type, c.hash, c.destinationAddress, c.amount)));
    }

    addressChanged(address: string) {
        this.addressChangedSubject.next(address);
    }

    clipboardAddressClicked() {
        if (this.addressString && this.clipboardService.copyFromContent(this.addressString)) {
            console.log(`Copied ${this.addressString} to clipboard`);
        }
    }

    callTransactionClicked() {
        const modal = this.modalService.open(TransactionComponent);
        (<TransactionComponent>modal.componentInstance).mode = Mode.Call;
    }

    createNewTransactionClicked() {
        const modal = this.modalService.open(TransactionComponent);
        (<TransactionComponent>modal.componentInstance).mode = Mode.Create;
    }

    contractClicked(contract: ContractItem) {
    }
}
