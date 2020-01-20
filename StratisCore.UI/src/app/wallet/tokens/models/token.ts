export class Token {
  constructor(ticker: string, address: string, name: string, decimals: number = 0) {
    this.ticker = ticker;
    this.address = address;
    this.name = name || this.ticker;
    this.decimals = decimals;
  }

  ticker: string;
  address: string;
  name: string;
  decimals: number;
}

export class SavedToken extends Token {
  constructor(ticker: string, address: string, balance: number, name: string, decimals: number = 0) {
    super(ticker, address, name, decimals);
    this.balance = balance;
  }

  get balance(): number {
    if (!this.decimals) {
      return this._balance 
    }

    return this._balance / (10**this.decimals);
  }

  set balance(value: number){
    this._balance = value;
  }

  get step() {
    let s = 1/10**this.decimals;
    return s.toFixed(this.decimals);
  }

  private _balance: number;

  public toScaledAmount(amount: number): number {
    if (this.decimals == null) {
      return amount;
    }

    return amount * (10**this.decimals);
  }

  // Numbers less than 1e-6 will be formatted by javascript using scientific notation.
  // Use this to get them into a readable format.
  get formattedBalance(): string {
    return (this.balance || 0).toFixed(this.decimals);
  }
}
