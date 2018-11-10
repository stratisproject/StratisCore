import { Component, OnInit } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';
import { ClipboardService } from 'ngx-clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SmartContractsServiceBase, ContractTransactionItem } from '../smart-contracts.service';
import { GlobalService } from '../../../shared/services/global.service';
import { TransactionComponent, Mode } from './modals/transaction/transaction.component';
import { ModalService } from '../../../shared/services/modal.service';

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
    addresses: string[];
    addressChangedSubject: Subject<string>;
    balance: number;
    contracts: ContractItem[];
    selectedAddress: string;
    history: ContractTransactionItem[];
    coinUnit: string;

    constructor(private globalService: GlobalService, 
        private smartContractsService: SmartContractsServiceBase,
        private clipboardService: ClipboardService,
        private modalService: NgbModal,
        private genericModalService: ModalService) {
        
        this.coinUnit = this.globalService.getCoinUnit();
        this.walletName = this.globalService.getWalletName();
        this.addressChangedSubject = new Subject();

        this.smartContractsService
            .GetAddresses(this.walletName)
            .catch(error => Observable.throw(error.json().errors[0].message))
            .subscribe(addresses => {
                if (addresses && addresses.length > 0) {
                    this.addressChangedSubject.next(addresses[0]);
                    this.addresses = addresses;
                }
            },
            error => this.showApiError("Error retrieving addresss. " + error));

        this.addressChangedSubject
                .flatMap(x => this.smartContractsService.GetAddressBalance(x)
                    .catch(error => Observable.throw(error.json().errors[0].message))
                )
                .subscribe(balance => this.balance = balance,
                    error => this.showApiError("Error retrieving balance. " + error)
                );                

        this.addressChangedSubject
            .flatMap(address => this.smartContractsService.GetHistory(this.walletName, address)
                .catch(error => Observable.throw(error.json().errors[0].message))
            )
            .subscribe(history => this.history = history,
                error => this.showApiError("Error retrieving transactions. " + error));


        this.addressChangedSubject.subscribe(address => this.selectedAddress = address);
    }

    ngOnInit() {
        this.smartContractsService
            .GetContracts(this.walletName)
            .subscribe(x =>
                this.contracts = x.map(c => new ContractItem(c.blockId, c.type, c.hash, c.destinationAddress, c.amount)));
    }

    showApiError(error: string)
    {
        this.genericModalService.openModal("Error", error);
    }

    addressChanged(address: string) {
        this.addressChangedSubject.next(address);
    }

    clipboardAddressClicked() {
        if (this.selectedAddress && this.clipboardService.copyFromContent(this.selectedAddress)) {
            console.log(`Copied ${this.selectedAddress} to clipboard`);
        }
    }

    callTransactionClicked() {
        this.showModal(Mode.Call);
    }

    createNewTransactionClicked() {
        this.showModal(Mode.Create);
    }

    showModal(mode: Mode)
    {
        const modal = this.modalService.open(TransactionComponent);
        (<TransactionComponent>modal.componentInstance).mode = mode;
        (<TransactionComponent>modal.componentInstance).selectedSenderAddress = this.selectedAddress;
        (<TransactionComponent>modal.componentInstance).balance = this.balance;
        (<TransactionComponent>modal.componentInstance).coinUnit = this.coinUnit;
    }

    contractClicked(contract: ContractItem) {
    }
}
