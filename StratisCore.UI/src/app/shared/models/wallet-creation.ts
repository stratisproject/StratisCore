export class WalletCreation {
  constructor(name: string, mnemonic: string, password: string, passphrase: string, folderPath: string = null ) {
    this.name = name;
    this.mnemonic = mnemonic;
    this.password = password;
    this.passphrase = passphrase;
    this.folderPath = folderPath;
  }

  name: string;
  mnemonic: string;
  password: string;
  passphrase: string;
  folderPath?: string;
}
