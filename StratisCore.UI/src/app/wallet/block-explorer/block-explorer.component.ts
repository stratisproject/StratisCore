import { Component, OnDestroy, OnInit } from '@angular/core';
import { BlockExplorerService } from "@shared/services/block-explorer-service";
import { GlobalService } from "@shared/services/global.service";
import { Subscription } from "rxjs";
import { SnackbarService } from "ngx-snackbar";

@Component({
  selector: 'app-block-explorer',
  templateUrl: './block-explorer.component.html',
  styleUrls: ['./block-explorer.component.scss']
})
export class BlockExplorerComponent implements OnInit, OnDestroy{
  public loading: boolean;
  private subscriptions: Subscription[] = [];

  constructor(
    private snackBarService: SnackbarService,
    public globalService: GlobalService,
    public blockExplorerService: BlockExplorerService) {

    window.addEventListener("scroll", () => this.detectLoading());

    this.subscriptions.push(
      this.blockExplorerService.loading.subscribe(loading => {
        this.loading = loading;
        this.detectLoading();
      }));
  }

  private detectLoading(): any {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
      if (this.loading) {
        this.snackBarService.add({
          msg: "",
          customClass: "loading-snack-bar",
          action: {
            text: null
          }
        });
      } else {
        this.snackBarService.clear()
      }
    }
  }

  ngOnInit(): void {
  }

  openTransactionDetailDialog(_transaction: any): void {

  }

  public onScroll(): void {
   // this.walletService.paginateHistory(40, this.last.transactionTimestamp, this.last.txOutputIndex);
    //console.log("scroll");
  }

  public ngOnDestroy(): void {
    window.removeEventListener("scroll", () => this.detectLoading());
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
