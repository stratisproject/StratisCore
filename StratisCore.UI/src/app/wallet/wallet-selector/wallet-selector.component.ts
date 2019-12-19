import { Component, OnInit } from '@angular/core';
import { GlobalService } from "@shared/services/global.service";
import { WalletService } from "@shared/services/wallet.service";
import { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";

@Component({
  selector: 'app-wallet-selector',
  templateUrl: './wallet-selector.component.html',
  styleUrls: ['./wallet-selector.component.css']
})
export class WalletSelectorComponent implements OnInit {
  public walletName: string = "Test";
  public walletNames: Observable<string[]>;

  constructor(
    public globalService: GlobalService,
    private walletService: WalletService) {
    this.walletNames = walletService.getWalletNames()
      .pipe(map(response => null != response ? response.walletNames : []));
  }

  public ngOnInit(): void {
    this.walletService.getWalletNames()
  }

  public switchWallet(walletName: string): void {
  }
}
