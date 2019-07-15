export class Token {
  constructor(ticker: string, address: string) {
    this.ticker = ticker;
    this.address = address;
  }

  ticker: string;
  address: string;
}

export class SavedToken extends Token {
  constructor(ticker: string, address: string, balance: number) {
    super(ticker, address);
    this.balance = balance;
  }

  balance: number;
}
