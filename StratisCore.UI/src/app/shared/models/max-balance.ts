export class MaxBalance {
  constructor(
    public walletName: string,
    public account: number = 0
  ) {}
}

export class MaxBalanceRequest extends MaxBalance {
  constructor(
    walletName: string,
    account = 0,
    public opReturnData?: string,
    public opReturnAmount?: string,
    public burnFullBalance?: string,
    public feeType?: string
  ) {
    super(walletName, account);
  }
}
