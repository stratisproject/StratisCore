export class Token {
  constructor(ticker: string, hash: string) {
    this.ticker = ticker;
    this.hash = hash;
  }

  ticker: string;
  hash: string;
}

export class SavedToken extends Token {
  balance: number;
}
