export class Recipient {
  constructor(destinationAddress: string, amount: string) {
    this.destinationAddress = destinationAddress;
    this.amount = amount;
  }

  destinationAddress: string;
  amount: string;
}

export class SidechainFeeEstimation {
  constructor(walletName: string, accountName: string, federationAddress: string, destinationAddress: string, amount: string, feeType: string, allowUnconfirmed: boolean) {
      this.walletName = walletName;
      this.accountName = accountName;
      this.recipients = [new Recipient(federationAddress, amount)];
      this.opreturndata = destinationAddress;
      this.feeType = feeType;
      this.allowUnconfirmed = allowUnconfirmed;
  }

  walletName: string;
  accountName: string;
  recipients: Recipient[];
  opreturndata: string;
  feeType: string;
  allowUnconfirmed: boolean;
}
