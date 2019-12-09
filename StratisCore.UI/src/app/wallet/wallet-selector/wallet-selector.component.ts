import { Component, OnInit } from '@angular/core';
import { GlobalService } from "@shared/services/global.service";

@Component({
  selector: 'app-wallet-selector',
  templateUrl: './wallet-selector.component.html',
  styleUrls: ['./wallet-selector.component.css']
})
export class WalletSelectorComponent implements OnInit {
  public walletName: string = "Test";
  accountsEnabled: boolean;
  sidechainEnabled: boolean;

  constructor(private globalService : GlobalService) { }

  ngOnInit() {
  }

  switchAddress() {

  }

  openAddressBook() {

  }

  openAdvanced() {

  }

  logoutClicked() {

  }
}
