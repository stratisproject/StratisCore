export class SignMessageRequest {
  constructor(walletName: string, password: string, externalAddress: string, message: string) {
    this.walletName = walletName;
    this.password = password;
    this.externalAddress = externalAddress;
    this.message = message;
  }

  walletName: string;
  password: string;
  externalAddress: string;
  message: string;
}
