import { AddressLabel } from '@shared/models/address-label';
import { TransactionsHistoryItem } from '@shared/services/interfaces/api.i';
import { AddressBookService } from '@shared/services/address-book-service';

export interface Payment {
  destinationAddress: string;
  amount: number;
}

export class TransactionInfo {
  constructor(
    public transactionType: string,
    public transactionId: string,
    public transactionAmount: number,
    public transactionFee: number,
    public txOutputIndex: number,
    public transactionConfirmedInBlock: number,
    public transactionTimestamp: number,
    public payments?: Payment[],
    public address?: string,
    public contact?: AddressLabel) {
  }

  public get id(): string {
    return this.transactionId;
  }

  public get timestamp(): number {
    return this.transactionTimestamp;
  }

  public static mapFromTransactionsHistoryItems(
    transactions: TransactionsHistoryItem[],
    maxTransactionCount?: number,
    addressBookService?: AddressBookService): TransactionInfo[] {

    const toMap = maxTransactionCount ? transactions.slice(0, maxTransactionCount) : transactions;
    return toMap.map(transaction => {
        return this.mapFromTransactionsHistoryItem(transaction, addressBookService)
      }
    );
  }

  public static mapFromTransactionsHistoryItem(transaction: TransactionsHistoryItem, addressBookService?: AddressBookService): TransactionInfo {
    const contact = addressBookService ? transaction.payments
      .map(payment => addressBookService.findContactByAddress(payment.destinationAddress)).find(p => p != null) : null;

    return new TransactionInfo(
      transaction.type === 'send' ? 'sent' : transaction.type,
      transaction.id,
      transaction.amount,
      transaction.fee || 0,
      transaction.txOutputIndex,
      transaction.confirmedInBlock,
      transaction.timestamp, transaction.payments, transaction.toAddress, contact);
  }
}
