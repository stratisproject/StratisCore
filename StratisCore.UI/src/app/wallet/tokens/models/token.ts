import BigNumber from 'bignumber.js';

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
  constructor(ticker: string, address: string, balance: string, name: string, decimals: number = 0) {
    super(ticker, address, name, decimals);
    this.balance = balance;
  }

  get balance(): string {
    if (!this.decimals) {
      return this._balance.toFixed(); 
    }

    return this._balance.dividedBy(10**this.decimals).toFixed();
  }

  set balance(value: string){
    this._balance = new BigNumber(value);
  }

  private _balance: BigNumber;

  public toScaledAmount(amount: number): BigNumber {
    if (this.decimals == null) {
      return new BigNumber(amount);
    }

    return new BigNumber(amount).multipliedBy(10**this.decimals);
  }
}
