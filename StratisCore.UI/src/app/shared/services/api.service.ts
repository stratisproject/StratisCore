import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import "rxjs/add/observable/interval";
import 'rxjs/add/operator/startWith';

import { GlobalService } from './global.service';
import { ElectronService } from 'ngx-electron';

import { AddressLabel } from '../classes/address-label';
import { WalletCreation } from '../classes/wallet-creation';
import { WalletRecovery } from '../classes/wallet-recovery';
import { WalletLoad } from '../classes/wallet-load';
import { WalletInfo } from '../classes/wallet-info';
import { SidechainFeeEstimation } from '../classes/sidechain-fee-estimation';
import { FeeEstimation } from '../classes/fee-estimation';
import { TransactionBuilding } from '../classes/transaction-building';
import { TransactionSending } from '../classes/transaction-sending';

/**
 * For information on the API specification have a look at our swagger files located at http://localhost:5000/swagger/ when running the daemon
 */
@Injectable()
export class ApiService {

    constructor(private http: Http, private globalService: GlobalService, private electronService: ElectronService) {
      this.setApiPort();
    };

    private headers = new Headers({'Content-Type': 'application/json'});
    private pollingInterval = 3000;
    private apiPort;
    private stratisApiUrl;

    setApiPort() {
      this.apiPort = this.electronService.ipcRenderer.sendSync('get-port');
      this.stratisApiUrl = 'http://localhost:' + this.apiPort + '/api';
    }

    getNodeStatus(): Observable<any> {
      return this.http
        .get(this.stratisApiUrl + '/node/status')
        .map((response: Response) => response);
    }

    getNodeStatusInterval(): Observable<any> {
      return Observable
        .interval(this.pollingInterval)
        .startWith(0)
        .switchMap(() => this.http.get(this.stratisApiUrl + '/node/status'))
        .map((response: Response) => response);
    }

    getAddressBookAddresses(): Observable<any> {
      return Observable
        .interval(this.pollingInterval)
        .startWith(0)
        .switchMap(() => this.http.get(this.stratisApiUrl + '/AddressBook'))
        .map((response: Response) => response);
    }

    addAddressBookAddress(data: AddressLabel): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/AddressBook/address', JSON.stringify(data), {headers: this.headers})
        .map((response: Response) => response);
    }

    removeAddressBookAddress(label: string): Observable<any> {
      const params: URLSearchParams = new URLSearchParams();
      params.set('label', label);
      return this.http
        .delete(this.stratisApiUrl + '/AddressBook/address', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

    /**
     * Gets available wallets at the default path
     */
    getWalletFiles(): Observable<any> {
      return this.http
        .get(this.stratisApiUrl + '/wallet/files')
        .map((response: Response) => response);
     }

    /** Gets the extended public key from a certain wallet */
    getExtPubkey(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', 'account 0');

      return this.http
        .get(this.stratisApiUrl + '/wallet/extpubkey', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

     /**
      * Get a new mnemonic
      */
    getNewMnemonic(): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('language', 'English');
      params.set('wordCount', '12');

      return this.http
        .get(this.stratisApiUrl + '/wallet/mnemonic', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

    /**
     * Create a new Stratis wallet.
     */
    createStratisWallet(data: WalletCreation): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/wallet/create/', JSON.stringify(data), {headers: this.headers})
        .map((response: Response) => response);
    }

    /**
     * Recover a Stratis wallet.
     */
    recoverStratisWallet(data: WalletRecovery): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/wallet/recover/', JSON.stringify(data), {headers: this.headers})
        .map((response: Response) => response);
    }

    /**
     * Load a Stratis wallet
     */
    loadStratisWallet(data: WalletLoad): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/wallet/load/', JSON.stringify(data), {headers: this.headers})
        .map((response: Response) => response);
    }

    /**
     * Get wallet status info from the API.
     */
    getWalletStatus(): Observable<any> {
      return this.http
        .get(this.stratisApiUrl + '/wallet/status')
        .map((response: Response) => response);
    }

    /**
     * Get general wallet info from the API once.
     */
    getGeneralInfoOnce(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('Name', data.walletName);

      return this.http
        .get(this.stratisApiUrl + '/wallet/general-info', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

    /**
     * Get general wallet info from the API.
     */
    getGeneralInfo(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('Name', data.walletName);

      return Observable
        .interval(this.pollingInterval)
        .startWith(0)
        .switchMap(() => this.http.get(this.stratisApiUrl + '/wallet/general-info', new RequestOptions({headers: this.headers, params: params})))
        .map((response: Response) => response);
    }

    /**
     * Get wallet balance info from the API.
     */
    getWalletBalance(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', "account 0");

      return Observable
        .interval(this.pollingInterval)
        .startWith(0)
        .switchMap(() => this.http.get(this.stratisApiUrl + '/wallet/balance', new RequestOptions({headers: this.headers, params: params})))
        .map((response: Response) => response);
    }

    /**
     * Get the maximum sendable amount for a given fee from the API
     */
    getMaximumBalance(data): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', "account 0");
      params.set('feeType', data.feeType);
      params.set('allowUnconfirmed', "true");

      return this.http
        .get(this.stratisApiUrl + '/wallet/maxbalance', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

    /**
     * Get a wallets transaction history info from the API.
     */
    getWalletHistory(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', "account 0");

      return Observable
        .interval(this.pollingInterval)
        .startWith(0)
        .switchMap(() => this.http.get(this.stratisApiUrl + '/wallet/history', new RequestOptions({headers: this.headers, params: params})))
        .map((response: Response) => response);
    }

    /**
     * Get an unused receive address for a certain wallet from the API.
     */
    getUnusedReceiveAddress(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', "account 0"); //temporary

      return this.http
        .get(this.stratisApiUrl + '/wallet/unusedaddress', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

    /**
     * Get multiple unused receive addresses for a certain wallet from the API.
     */
    getUnusedReceiveAddresses(data: WalletInfo, count: string): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', "account 0"); //temporary
      params.set('count', count);

      return this.http
        .get(this.stratisApiUrl + '/wallet/unusedaddresses', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

    /**
     * Get get all addresses for an account of a wallet from the API.
     */
    getAllAddresses(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', "account 0"); //temporary

      return this.http
        .get(this.stratisApiUrl + '/wallet/addresses', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

    /**
     * Estimate the fee of a transaction
     */
    estimateFee(data: FeeEstimation): Observable<any> {
      // let params = data;
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', data.accountName);
      params.set('recipients[0].destinationAddress', data.recipients[0].destinationAddress);
      params.set('recipients[0].amount', data.recipients[0].amount);
      params.set('feeType', data.feeType);
      params.set('allowUnconfirmed', "true");

      return this.http
        .get(this.stratisApiUrl + '/wallet/estimate-txfee', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

    /**
     * Estimate the fee of a sidechain transaction
     */
    estimateSidechainFee(data: SidechainFeeEstimation): Observable<any> {
      // let params = data;
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', data.accountName);
      params.set('recipients[0].destinationAddress', data.recipients[0].destinationAddress);
      params.set('recipients[0].amount', data.recipients[0].amount);
      params.set('feeType', data.feeType);
      params.set('allowUnconfirmed', "true");

      return this.http
        .get(this.stratisApiUrl + '/wallet/estimate-txfee', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

    /**
     * Build a transaction
     */
    buildTransaction(data: TransactionBuilding): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/wallet/build-transaction', JSON.stringify(data), {headers: this.headers})
        .map((response: Response) => response);
    }

    /**
     * Send transaction
     */
    sendTransaction(data: TransactionSending): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/wallet/send-transaction', JSON.stringify(data), {headers: this.headers})
        .map((response: Response) => response);
    }

    /** Remove transaction */
    removeTransaction(walletName: string): Observable<any> {
      const params: URLSearchParams = new URLSearchParams();
      params.set('walletName', walletName);
      params.set('all', 'true');
      params.set('resync', 'true');

      return this.http
        .delete(this.stratisApiUrl + '/wallet/remove-transactions', new RequestOptions({headers: this.headers, params: params}))
        .map((response: Response) => response);
    }

    /**
     * Start staking
     */
    startStaking(data: any): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/staking/startstaking', JSON.stringify(data), {headers: this.headers})
        .map((response: Response) => response);
    }

    /**
     * Get staking info
     */
    getStakingInfo(): Observable<any> {
      return Observable
        .interval(this.pollingInterval)
        .startWith(0)
        .switchMap(() => this.http.get(this.stratisApiUrl + '/staking/getstakinginfo'))
        .map((response: Response) => response);
    }

    /**
      * Stop staking
      */
    stopStaking(): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/staking/stopstaking', {headers: this.headers})
        .map((response: Response) => response);
    }

    /**
     * Send shutdown signal to the daemon
     */
    shutdownNode(): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/node/shutdown', 'corsProtection:true', {headers: this.headers})
        .map((response: Response) => response);
    }

    /*
     * Get the active smart contract wallet address.
     */
    getAccountAddress(walletName: string): Observable<Response> {

      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', walletName);

      return this.http
        .get(this.stratisApiUrl + '/smartcontractwallet/account-address', new RequestOptions({headers: this.headers, params: params}));
    }

    getAccountAddresses(walletName: string): any {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', walletName);

      return this.http
        .get(this.stratisApiUrl + '/smartcontractwallet/account-addresses', new RequestOptions({headers: this.headers, params: params}));
    }

    /*
     * Get the balance of the active smart contract address.
     */
    getAccountBalance(walletName: string): Observable<Response> {

      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', walletName);

      return this.http
        .get(this.stratisApiUrl + '/smartcontractwallet/account-balance', new RequestOptions({headers: this.headers, params: params}));
    }

    /*
     * Get the balance of the active smart contract address.
     */
    getAddressBalance(address: string): Observable<Response> {

      let params: URLSearchParams = new URLSearchParams();
      params.set('address', address);

      return Observable
        .interval(this.pollingInterval)
        .startWith(0)
        .switchMap(() => this.http.get(this.stratisApiUrl + '/smartcontractwallet/address-balance', new RequestOptions({headers: this.headers, search: params})));
    }

    /*
     * Gets the transaction history of the smart contract account.
     */
    getAccountHistory(walletName: string, address: string): Observable<Response> {

      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', walletName);
      params.set('address', address);

      return Observable
          .interval(this.pollingInterval)
          .startWith(0)
          .switchMap(() => this.http.get(this.stratisApiUrl + '/smartcontractwallet/history', new RequestOptions({headers: this.headers, search: params})));
    }

    /*
     * Posts a contract creation transaction
     */
    postCreateTransaction(transaction: any): Observable<Response> {
      return this.http
        .post(this.stratisApiUrl + '/smartcontractwallet/create', transaction, new RequestOptions({headers: this.headers}));
    }

    /*
     * Posts a contract call transaction
     */
    postCallTransaction(transaction: any): Observable<Response> {
      return this.http
        .post(this.stratisApiUrl + '/smartcontractwallet/call', transaction, new RequestOptions({headers: this.headers}));
    }

    /*
     * Returns the receipt for a particular txhash, or empty JSON.
     */
    getReceipt(hash: string): any {
      let params: URLSearchParams = new URLSearchParams();
      params.set('txHash', hash);

      return this.http
        .get(this.stratisApiUrl + '/smartcontracts/receipt', new RequestOptions({headers: this.headers, search: params}));
    }

}
