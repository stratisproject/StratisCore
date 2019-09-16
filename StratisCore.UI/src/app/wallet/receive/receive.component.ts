import { Component, OnInit } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { WalletInfo } from '@shared/models/wallet-info';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CurrentAccountService } from '@shared/services/current-account.service';
import { ModalService } from '@shared/services/modal.service';
import { WalletService } from '@shared/services/wallet.service';

@Component({
  selector: 'receive-component',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.css'],
})

export class ReceiveComponent implements OnInit {
  accountsEnabled: boolean;
  constructor(
    private walletService: WalletService,
    private globalService: GlobalService,
    public activeModal: NgbActiveModal,
    private genericModalService: ModalService,
    private currentAccountService: CurrentAccountService) {}

  public address: any = '';
  public qrString: any;
  public copied = false;
  public showAll = false;
  public allAddresses: any;
  public usedAddresses: string[];
  public unusedAddresses: string[];
  public changeAddresses: string[];
  public pageNumberUsed = 1;
  public pageNumberUnused = 1;
  public pageNumberChange = 1;
  public sidechainEnabled: boolean;

  public ngOnInit(): void {
    this.sidechainEnabled = this.globalService.getSidechainEnabled();
    this.accountsEnabled = this.sidechainEnabled && this.currentAccountService.hasActiveAddress();

    if (!this.accountsEnabled) {
      this.getUnusedReceiveAddresses();
    } else {
      // If accounts are enabled, we just use the account address
      this.getAccountAddress();
    }
  }

  public onCopiedClick(): void {
    this.copied = true;
  }

  public showAllAddresses(): void {
    this.getAddresses();
    this.showAll = true;
  }

  public showOneAddress(): void {
    this.getUnusedReceiveAddresses();
    this.showAll = false;
  }

  private getUnusedReceiveAddresses(): void {
    const walletInfo = new WalletInfo(this.globalService.getWalletName());
    this.walletService.getUnusedReceiveAddress(walletInfo)
      .toPromise()
      .then(
        response => {
            this.address = response;
            this.setQrString(response);
        }
      );
  }

  private getAccountAddress() {
    this.address = this.currentAccountService.address;
    this.setQrString(this.address);
  }

  private setQrString(address: string) {
    // TODO: fix this later to use the actual sidechain name instead of 'cirrus'
    this.qrString = `${this.globalService.networkName}:${address}`;
  }

  private getAddresses() {
    const walletInfo = new WalletInfo(this.globalService.getWalletName());
    this.walletService.getAllAddressesForWallet(walletInfo)
      .toPromise()
      .then(
        response => {
          this.allAddresses = [];
          this.usedAddresses = [];
          this.unusedAddresses = [];
          this.changeAddresses = [];
          this.allAddresses = response.addresses;

          for (const address of this.allAddresses) {
            if (address.isUsed) {
              this.usedAddresses.push(address.address);
            } else if (address.isChange) {
              this.changeAddresses.push(address.address);
            } else {
              this.unusedAddresses.push(address.address);
            }
          }
        });
  }
}
