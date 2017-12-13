export class TransactionBuilding {

  constructor(walletName: string, accountName: string, password: string, destinationAddress: string, amount: string, feeType: string, allowUnconfirmed: boolean, shuffleOutputs: boolean) {
    this.walletName = walletName;
    this.accountName = accountName;
    this.password = password;
    this.destinationAddress = destinationAddress;
    this.amount = amount;
    this.feeType = feeType;
    this.allowUnconfirmed = allowUnconfirmed;
    this.shuffleOutputs = shuffleOutputs;
  }

  walletName: string;
  accountName: string;
  password: string;
  destinationAddress: string;
  amount: string;
  feeType: string;
  allowUnconfirmed: boolean;
  shuffleOutputs: boolean;
}
