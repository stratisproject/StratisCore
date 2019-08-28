import { Transaction } from '@shared/models/transaction';

export class TransactionResponse {
  constructor(public transaction: Transaction, public transactionFee: number, public isSideChain: boolean) {
  }
}

export class BuildTransactionResponse {
  constructor(public fee: number, public hex: string, public  isSideChain: boolean) {
  }

}
