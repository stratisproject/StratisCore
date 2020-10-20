export class OpreturnTransaction {
  constructor(
    public walletName: string,
    public accountName: string,
    public password: string,
    public feeAmount: number,
    public allowUnconfirmed: boolean,
    public shuffleOutputs: boolean,
    public opReturnData?: string,
    public opReturnAmount?: string,
    public changeAddress?: string,
    public isSideChainTransaction?: boolean) { }

  public sender: string;
}
