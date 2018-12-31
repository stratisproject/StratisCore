export class Recipient {
  constructor(destinationAddress: string, amount: string) {
    this.destinationAddress = destinationAddress;
    this.amount = amount;
  }

  destinationAddress: string;
  amount: string;
}

export class FeeEstimation {
    constructor(walletName: string, accountName: string, destinationAddress: string, amount: string, feeType: string, allowUnconfirmed: boolean) {
        this.walletName = walletName;
        this.accountName = accountName;
        this.recipients = [new Recipient(destinationAddress, amount)];
        this.feeType = feeType;
        this.allowUnconfirmed = allowUnconfirmed;
    }

    walletName: string;
    accountName: string;
    recipients: Recipient[];
    feeType: string;
    allowUnconfirmed: boolean;
}
