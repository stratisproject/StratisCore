import { TransactionsHistoryItem } from '@shared/services/interfaces/api.i';
import { AddressLabel } from '@shared/models/address-label';
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

  public static mapFromTransactionsHistoryItems(
    transactions: TransactionsHistoryItem[],
    maxTransactionCount?: number,
    addressBookService?: AddressBookService): TransactionInfo[] {


    const mapped = transactions.map(transaction => {
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
    });

    return maxTransactionCount ? mapped.slice(0, maxTransactionCount) : mapped;

  }
}
