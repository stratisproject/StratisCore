import { Component, OnInit } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { GlobalService } from '@shared/services/global.service';
import { WalletInfo } from '@shared/models/wallet-info';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'receive-component',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.css'],
})

export class ReceiveComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private globalService: GlobalService,
    public activeModal: NgbActiveModal) {
  }

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
    this.getUnusedReceiveAddresses();
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
    this.apiService.getUnusedReceiveAddress(walletInfo)
      .toPromise().then(
      response => {
        this.address = response;
        // TODO: fix this later to use the actual sidechain name instead of 'cirrus'
        const networkName = this.globalService.getSidechainEnabled() ? 'cirrus' : 'stratis';
        this.qrString = `${networkName}:${response}`;
      }
    );
  }

  private getAddresses(): void {
    const walletInfo = new WalletInfo(this.globalService.getWalletName());
    this.apiService.getAllAddresses(walletInfo)
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
