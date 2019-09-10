import { TransactionsHistoryItem } from '@shared/services/interfaces/api.i';

export class TransactionInfo {
  constructor(
    transactionType: string,
    transactionId: string,
    transactionAmount: number,
    transactionFee: number,
    transactionConfirmedInBlock: number,
    transactionTimestamp: number) {
    this.transactionType = transactionType;
    this.transactionId = transactionId;
    this.transactionAmount = transactionAmount;
    this.transactionFee = transactionFee;
    this.transactionConfirmedInBlock = transactionConfirmedInBlock;
    this.transactionTimestamp = transactionTimestamp;
  }

  public transactionType: string;
  public transactionId: string;
  public transactionAmount: number;
  public transactionFee: number;
  public transactionConfirmedInBlock?: number;
  public transactionTimestamp: number;

  public static mapFromTransactionsHistoryItems(transactions: TransactionsHistoryItem[], maxTransactionCount?: number): TransactionInfo[] {
    const mapped = transactions.map(transaction => {
      return new TransactionInfo(
        transaction.type === 'send' ? 'sent' : transaction.type,
        transaction.id,
        transaction.amount,
        transaction.fee || 0,
        transaction.confirmedInBlock,
        transaction.timestamp);
    });

    return maxTransactionCount ? mapped.slice(0, maxTransactionCount) : mapped;

  }
}
