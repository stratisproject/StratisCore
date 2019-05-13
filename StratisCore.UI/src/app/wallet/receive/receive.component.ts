import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../shared/services/api.service';
import { GlobalService } from '../../shared/services/global.service';
import { ModalService } from '../../shared/services/modal.service';

import { WalletInfo } from '../../shared/models/wallet-info';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'receive-component',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.css'],
})

export class ReceiveComponent {
  constructor(private apiService: ApiService, private globalService: GlobalService, public activeModal: NgbActiveModal, private genericModalService: ModalService) {}

  public address: any = "";
  public qrString: any;
  public copied: boolean = false;
  public showAll = false;
  public allAddresses: any;
  public usedAddresses: string[];
  public unusedAddresses: string[];
  public changeAddresses: string[];
  public pageNumberUsed: number = 1;
  public pageNumberUnused: number = 1;
  public pageNumberChange: number = 1;
  private errorMessage: string;

  ngOnInit() {
    this.getUnusedReceiveAddresses();
  }

  public onCopiedClick() {
    this.copied = true;
  }

  public showAllAddresses(){
    this.getAddresses();
    this.showAll = true;
  }

  public showOneAddress(){
    this.getUnusedReceiveAddresses();
    this.showAll = false;
  }

  private getUnusedReceiveAddresses() {
    const walletInfo = new WalletInfo(this.globalService.getWalletName())
    this.apiService.getUnusedReceiveAddress(walletInfo)
      .subscribe(
        response => {
            this.address = response;

            // TODO: fix this later to use the actual sidechain name instead of 'cirrus'
            const networkName = this.globalService.getSidechainEnabled ? 'cirrus' : 'stratis';
            this.qrString = `${networkName}:${response}`;
        }
      );
  }

  private getAddresses() {
    let walletInfo = new WalletInfo(this.globalService.getWalletName())
    this.apiService.getAllAddresses(walletInfo)
      .subscribe(
        response => {
          this.allAddresses = [];
          this.usedAddresses = [];
          this.unusedAddresses = [];
          this.changeAddresses = [];
          this.allAddresses = response.addresses;

          for (let address of this.allAddresses) {
            if (address.isUsed) {
              this.usedAddresses.push(address.address);
            } else if (address.isChange) {
              this.changeAddresses.push(address.address);
            } else {
              this.unusedAddresses.push(address.address);
            }
          }
        }
      );
  }
}
