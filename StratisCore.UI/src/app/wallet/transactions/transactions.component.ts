import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TransactionInfo } from '@shared/models/transaction-info';
import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '@shared/services/global.service';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { WalletService } from '@shared/services/wallet.service';
import { SnackbarService } from 'ngx-snackbar';
import { AddressBookService } from '@shared/services/address-book-service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  public transactions: Observable<TransactionInfo[]>;
  private subscriptions: Subscription[] = [];
  public loading = false;

  @Input() public enablePagination: boolean;
  @Input() public maxTransactionCount: number;
  @Input() public title: string;
  @Input() public stakingOnly: boolean;
  @Output() public rowClicked: EventEmitter<TransactionInfo> = new EventEmitter();
  private last: TransactionInfo;

  public constructor(
    private globalService: GlobalService,
    private snackBarService: SnackbarService,
    private modalService: NgbModal,
    private addressBookService: AddressBookService,
    public walletService: WalletService) {

    window.addEventListener('scroll', () => this.detectLoading());

    this.subscriptions.push(
      this.walletService.loading.subscribe(loading => {
        this.loading = loading;
        this.detectLoading();
      }));
  }

  private detectLoading(): any {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
      if (this.loading) {
        this.snackBarService.add({
          msg: '',
          customClass: 'loading-snack-bar',
          action: {
            text: null
          }
        });
      } else {
        this.snackBarService.clear();
      }
    }
  }

  public ngOnInit(): void {
    this.transactions = this.walletService.walletHistory()
      .pipe(map((historyItems => {
        return ((null != historyItems && historyItems.length > 0))
        ? this.stakingOnly
            // tslint:disable-next-line:max-line-length
          ?  TransactionInfo.mapFromTransactionsHistoryItems(historyItems.filter(items => items.type === 'staked'), this.maxTransactionCount, this.addressBookService)
          : TransactionInfo.mapFromTransactionsHistoryItems(historyItems, this.maxTransactionCount, this.addressBookService)
        : [];

      })), tap(items => {
        const history = items as TransactionInfo[];
        this.last = history && history.length > 0 ? history[history.length - 1] : <TransactionInfo>{};
      }));
  }

  public openTransactionDetailDialog(transaction: TransactionInfo): void {
    this.rowClicked.emit(transaction);
    const modalRef = this.modalService.open(TransactionDetailsComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.transaction = transaction;
  }

  public onScroll() {
    this.walletService.paginateHistory(40, this.last.transactionTimestamp, this.last.txOutputIndex);
    console.log('scroll');
  }

  public ngOnDestroy() {
    window.removeEventListener('scroll', () => this.detectLoading());
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
