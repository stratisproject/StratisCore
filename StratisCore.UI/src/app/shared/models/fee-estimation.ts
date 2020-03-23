export class Recipient {
  constructor(destinationAddress: string, amount: string) {
    this.destinationAddress = destinationAddress;
    this.amount = amount;
  }

  destinationAddress: string;
  amount: string;

  public equals(recipient: Recipient): boolean {
    if (null == recipient) {
      return false;
    }
    if (this === recipient) {
      return true;
    }
    return this.destinationAddress === recipient.destinationAddress
      && Number.parseFloat(this.amount).toFixed(8) === Number.parseFloat(recipient.amount).toFixed(8);
  }
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
    this.changeAddress = changeAddress;
  }

  walletName: string;
  accountName: string;
  recipients: Recipient[];
  feeType: string;
  allowUnconfirmed: boolean;
  changeAddress: string;
  sender: string;
  shuffleOutputs: boolean;
  response: number;

  public equals(feeEstimation: FeeEstimation): boolean {
    if (null == feeEstimation) {
      return false;
    }
    if (this === feeEstimation) {
      return true;
    }
    return this.changeAddress === feeEstimation.changeAddress
      && this.allowUnconfirmed === feeEstimation.allowUnconfirmed
      && this.feeType === feeEstimation.feeType
      && this.accountName === feeEstimation.accountName
      && this.walletName === feeEstimation.walletName
      && this.recipients.length === feeEstimation.recipients.length
      && this.recipients.every(recipient => {
        return (feeEstimation.recipients
          .find(r => r.destinationAddress === recipient.destinationAddress) || new Recipient(null, null))
          .equals(recipient);
      });
  }
}
