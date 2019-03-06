export class WalletRescan {
  constructor(walletName: string, fromDate: Date, all: boolean, resync: boolean) {
    this.name = walletName;
    this.fromDate = fromDate;
    this.all = all;
    this.resync = resync;
  }

  name: string;
  fromDate: Date;
  all: boolean;
  resync: boolean;
}
