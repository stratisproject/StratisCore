import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { GlobalService } from '@shared/services/global.service';
import { TransactionInfo } from '@shared/models/transaction-info';
import { NodeService } from '@shared/services/node-service';
import { tap } from 'rxjs/operators';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'transaction-details-modal',
  templateUrl: './transaction-details-modal.component.html',
  styleUrls: ['./transaction-details-modal.component.scss'],
  animations : Animations.fadeIn
})
export class TransactionDetailsModalComponent implements OnInit, OnDestroy {

  @Input() transaction: TransactionInfo;

  constructor(private nodeService: NodeService, private globalService: GlobalService, public activeModal: NgbActiveModal) {
  }

  public copied = false;
  public coinUnit: string;
  public confirmations: number;
  private generalWalletInfoSubscription: Subscription;
  private lastBlockSyncedHeight: number;

  public ngOnInit(): void {
    this.coinUnit = this.globalService.getCoinUnit();
    this.subscribeToGeneralWalletInfo();
  }

  public ngOnDestroy(): void {
    if (this.generalWalletInfoSubscription) {
      this.generalWalletInfoSubscription.unsubscribe();
    }
  }

  public onCopiedClick(): void {
    this.copied = true;
  }

  private subscribeToGeneralWalletInfo(): void {
    this.generalWalletInfoSubscription = this.nodeService.generalInfo().pipe(tap(generalInfo => {
      this.lastBlockSyncedHeight = generalInfo.lastBlockSyncedHeight;
      this.calculateConfirmations();
    })).subscribe();
  }

  private calculateConfirmations(): void {
    if (this.transaction.transactionConfirmedInBlock) {
      this.confirmations = this.lastBlockSyncedHeight - Number(this.transaction.transactionConfirmedInBlock) + 1;
    } else {
      this.confirmations = 0;
    }
  }
}
