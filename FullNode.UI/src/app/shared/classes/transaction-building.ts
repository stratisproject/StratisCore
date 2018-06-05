export class TransactionBuilding {

  walletName: string;
  accountName: string;
  password: string;
  destinationAddress: string;
  amount: string;
  feeType: string;
  feeAmount: number;
  allowUnconfirmed: boolean;
  shuffleOutputs: boolean;
  opReturnData: string;

  constructor (
    walletName: string,
    accountName: string,
    password: string,
    destinationAddress: string,
    amount: string,
    feeType: string,
    feeAmount: number,
    allowUnconfirmed: boolean,
    shuffleOutputs: boolean,
    opReturnData: string) {

    this.walletName = walletName;
    this.accountName = accountName;
    this.password = password;
    this.destinationAddress = destinationAddress;
    this.amount = amount;
    this.feeType = feeType;
    this.feeAmount = feeAmount;
    this.allowUnconfirmed = allowUnconfirmed;
    this.shuffleOutputs = shuffleOutputs;
    this.opReturnData = opReturnData;
  }
}
