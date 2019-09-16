export class Recipient {
  constructor(destinationAddress: string, amount: string) {
    this.destinationAddress = destinationAddress;
    this.amount = amount;
  }

  destinationAddress: string;
  amount: string;
}

export class FeeEstimation {
  constructor(
    walletName: string,
    accountName: string,
    destinationAddress: string,
    amount: string,
    feeType: string,
    allowUnconfirmed: boolean,
    shuffleOutputs?: boolean,
    changeAddress?: string
  ) {
    this.walletName = walletName;
    this.accountName = accountName;
    this.recipients = [new Recipient(destinationAddress, amount)];
    this.feeType = feeType;
    this.allowUnconfirmed = allowUnconfirmed;
    this.shuffleOutputs = shuffleOutputs;
    this.changeAddress = changeAddress
  }

  walletName: string;
  accountName: string;
  recipients: Recipient[];
  feeType: string;
  allowUnconfirmed: boolean;
  changeAddress: string;
  sender: string;
  shuffleOutputs: boolean;
}
