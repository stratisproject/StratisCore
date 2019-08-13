export class WalletInfo {
  constructor(
    public walletName: string,
    public account: number = 0) {
  }
}

export class WalletInfoRequest extends WalletInfo {
  constructor(walletName: string,
              account: number = 0,
              public feeType?: string) {
    super(walletName, account);
  }
}
