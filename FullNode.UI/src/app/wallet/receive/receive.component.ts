import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../shared/services/api.service';
import { GlobalService } from '../../shared/services/global.service';
import { ModalService } from '../../shared/services/modal.service';

import { WalletInfo } from '../../shared/classes/wallet-info';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'receive-component',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.css'],
})

export class ReceiveComponent implements OnInit {
  public address: any = '';
  public qrString: any;
  public copied = false;
  public showAll = false;
  public allAddresses: any;
  public usedAddresses: string[];
  public unusedAddresses: string[];
  public changeAddresses: string[];
  private errorMessage: string;

  constructor(
    private apiService: ApiService,
    private globalService: GlobalService,
    public activeModal: NgbActiveModal,
    private genericModalService: ModalService) {}

  ngOnInit() {
    this.getUnusedReceiveAddresses();
  }

  public onCopiedClick() {
    this.copied = true;
  }

  public showAllAddresses() {
    this.getAddresses();
    this.showAll = true;
  }

  public showOneAddress() {
    this.getUnusedReceiveAddresses();
    this.showAll = false;
  }

  private getUnusedReceiveAddresses() {
    const walletInfo = new WalletInfo(this.globalService.WalletName);
    this.apiService.getUnusedReceiveAddress(walletInfo)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            this.address = response.json();
            this.qrString = 'stratis:' + response.json();
          }
        },
        error => {
          console.log(error);
          if (error.status === 0) {
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              this.genericModalService.openModal(null, error.json().errors[0].message);
            }
          }
        }
      )
    ;
  }

  private getAddresses() {
    const walletInfo = new WalletInfo(this.globalService.WalletName);
    this.apiService.getAllAddresses(walletInfo)
      .subscribe(
        response => {
          if (response.status >= 200 && response.status < 400) {
            this.allAddresses = [];
            this.usedAddresses = [];
            this.unusedAddresses = [];
            this.changeAddresses = [];
            this.allAddresses = response.json().addresses;

            for (const address of this.allAddresses) {
              if (address.isUsed) {
                this.usedAddresses.push(address.address);
              } else if (address.isChange) {
                this.changeAddresses.push(address.address);
              } else {
                this.unusedAddresses.push(address.address);
              }
            }

          }
        },
        error => {
          console.log(error);
          if (error.status === 0) {
            this.genericModalService.openModal(null, null);
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            } else {
              this.genericModalService.openModal(null, error.json().errors[0].message);
            }
          }
        }
      )
    ;
  }
}
