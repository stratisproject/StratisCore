export class VoteRequest {
  constructor(walletName: string, walletPassword: string, vote: boolean, accountName?: string) {
    this.walletName = walletName;
    this.walletPassword = walletPassword;
    this.vote = vote;
    this.accountName = accountName;
  }

  walletName: string;
  walletPassword: string;
  vote: boolean;
  accountName: string;
}
