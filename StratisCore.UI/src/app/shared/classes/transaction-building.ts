export class Recipient {
  constructor(destinationAddress: string, amount: string) {
    this.destinationAddress = destinationAddress;
    this.amount = amount;
  }

  destinationAddress: string;
  amount: string;
}

export class TransactionBuilding {

  constructor(walletName: string, accountName: string, password: string, destinationAddress: string, amount: string, feeAmount: number, allowUnconfirmed: boolean, shuffleOutputs: boolean) {
    this.walletName = walletName;
    this.accountName = accountName;
    this.password = password;
    this.recipients = [new Recipient(destinationAddress, amount)];
    this.feeAmount = feeAmount;
    this.allowUnconfirmed = allowUnconfirmed;
    this.shuffleOutputs = shuffleOutputs;
  }

  walletName: string;
  accountName: string;
  password: string;
  recipients: Recipient[];
  feeAmount: number;
  allowUnconfirmed: boolean;
  shuffleOutputs: boolean;
}
