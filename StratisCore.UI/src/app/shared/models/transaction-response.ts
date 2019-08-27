export class TransactionResponse {
  constructor(public transactionFee: number, public isSideChain: boolean) {
  }
}

export class BuildTransactionResponse {
  constructor(public fee: number, public hex: string, public  isSideChain: boolean) {
  }

}
