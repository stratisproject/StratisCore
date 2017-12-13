export class WalletRecovery {

  constructor(walletName: string, mnemonic: string, password: string, folderPath: string = null) {
    this.name = walletName;
    this.mnemonic = mnemonic;
    this.password = password;
    this.folderPath = folderPath;
  }

  mnemonic: string;
  password: string;
  name: string;
  folderPath?: string;
}
