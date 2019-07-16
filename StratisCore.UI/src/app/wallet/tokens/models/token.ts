export class Token {
  constructor(ticker: string, address: string, name: string) {
    this.ticker = ticker;
    this.address = address;
    this.name = name || this.ticker;
  }

  ticker: string;
  address: string;
  name: string;
}

export class SavedToken extends Token {
  constructor(ticker: string, address: string, balance: number, name: string) {
    super(ticker, address, name);
    this.balance = balance;
  }

  balance: number;
}
