export class WalletResync {
  constructor(walletName: string, date: Date, all: boolean) {
    this.walletName = walletName;
    this.date = date;
    this.all = all;
  }

  walletName: string;
  date: Date;
  all: boolean;
}
