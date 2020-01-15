import { Component, OnInit } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { WalletInfo } from '@shared/models/wallet-info';

import { CurrentAccountService } from '@shared/services/current-account.service';
import { WalletService } from '@shared/services/wallet.service';
import { ClipboardService } from 'ngx-clipboard';
import { SnackbarService } from 'ngx-snackbar';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'receive-component',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss'],
  animations: Animations.fadeIn
})

export class ReceiveComponent implements OnInit {
  accountsEnabled: boolean;
  constructor(
    private walletService: WalletService,
    private globalService: GlobalService,
    private currentAccountService: CurrentAccountService,
    private clipboardService: ClipboardService,
    private snackbarService: SnackbarService) {}

  public address: any = '';
  public qrString: any;
  public showAll = false;
  public allAddresses: any;
  public usedAddresses: string[];
  public unusedAddresses: string[];
  public changeAddresses: string[];
  public pageNumberUsed = 1;
  public pageNumberUnused = 1;
  public pageNumberChange = 1;
  public sidechainEnabled: boolean;
  public showAddressesButtonText = "Show all addresses";

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

  public copyToClipboardClicked(address): void {
    if (this.clipboardService.copyFromContent(address)) {
      this.snackbarService.add({
        msg: `Address ${address} copied to clipboard`,
        customClass: 'notify-snack-bar',
        action: {
          text: null
        }
      });
    }
  }

  public toggleAllAddresses(): void {
    this.showAll = !this.showAll;
    if (this.showAll) {
      this.getAddresses();
    }
    this.showAddressesButtonText = this.showAll ? "Hide all addresses" : "Show all addresses";
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

  private getAccountAddress(): void {
    this.address = this.currentAccountService.address;
    this.setQrString(this.address);
  }

  private setQrString(address: string): void {
    // TODO: fix this later to use the actual sidechain name instead of 'cirrus'
    this.qrString = `${this.globalService.networkName}:${address}`;
  }

  private getAddresses(): void {
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
