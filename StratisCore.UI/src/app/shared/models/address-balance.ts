export interface Address {
  address: string;
  isUsed: boolean;
  isChange: boolean;
  amountConfirmed: number;
  amountUnconfirmed: number;
}

export interface AddressBalance {
  addresses: Address[];
}
