import { AddressLabel } from '@shared/models/address-label';

export interface Payment {
  destinationAddress: string;
  amount: number;
}

export class TransactionInfo {
  constructor(
    public transactionType: string,
    public transactionId: string,
    public transactionAmount: number,
    public transactionFee: number,
    public txOutputIndex: number,
    public transactionConfirmedInBlock: number,
    public transactionTimestamp: number,
    public payments?: Payment[],
    public address?: string,
    public contact?: AddressLabel) {
  }
}
