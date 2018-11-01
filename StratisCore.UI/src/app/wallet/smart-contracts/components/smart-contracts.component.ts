import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { SmartContractsServiceBase } from '../smart-contracts.service';
import { GlobalService } from '../../../shared/services/global.service';
import { ClipboardService } from 'ngx-clipboard';

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
    private balanceSubscription: Subscription;

    constructor(private globalService: GlobalService, private smartContractsService: SmartContractsServiceBase, private clipboardService: ClipboardService) {
        this.walletName = this.globalService.getWalletName();
    }

    balance = '';
    address = '';
    contracts: ContractItem[];

    ngOnInit() {
        this.getBalance();
        this.smartContractsService.GetAddress(this.walletName).subscribe(x => this.address = x);
        this.smartContractsService.GetContracts(this.walletName).subscribe(x =>
            this.contracts = x.map(c => new ContractItem(c.blockId, c.type, c.hash, c.destinationAddress, c.amount)));
    }

    clipboardAddressClicked() {
        if (this.address && this.clipboardService.copyFromContent(this.address)) {
            console.log(`Copied ${this.address} to clipboard`);
        }
    }

    callTransactionClicked() {
    }

    createNewTransactionClicked() {
    }

    contractClicked(contract: ContractItem) {
    }

    private getBalance() {
        if (this.balanceSubscription) {
            this.balanceSubscription.unsubscribe();
        }
        this.balanceSubscription = this.smartContractsService.GetBalance(this.walletName)
            .subscribe(x => this.balance = x.toLocaleString());
    }
}
