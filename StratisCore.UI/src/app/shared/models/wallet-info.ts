export class WalletInfo {
  constructor(
    public walletName: string,
    public account: number = 0) {
  }

  public feeType? : string;
}
