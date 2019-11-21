import { Observable, of } from "rxjs";
import { ContractTransactionItem, SmartContractsContractItem } from "./smart-contracts.service";

export abstract class SmartContractsServiceBase {
  GetReceipt(hash: string): Observable<string> {
    return of();
  }

  GetReceiptSilent(hash: string): Observable<string> {
    return of();
  }

  GetAddresses(walletName: string): Observable<string[]> {
    return of();
  }

  GetBalance(walletName: string): Observable<number> {
    return of();
  }

  GetAddress(walletName: string): Observable<string> {
    return of();
  }

  GetContracts(walletName: string): Observable<SmartContractsContractItem[]> {
    return of();
  }

  GetSenderAddresses(walletName: string): Observable<string[]> {
    return of();
  }

  GetParameterTypes(walletName: string): Observable<string[]> {
    return of();
  }

  GetHistory(walletName: string, address: string): Observable<ContractTransactionItem[]> {
    return of();
  }

  PostCreate(createTransaction: any): Observable<any> {
    return of();
  }

  PostCall(createTransaction: any): Observable<any> {
    return of();
  }
}
