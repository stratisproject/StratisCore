import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import "rxjs/add/observable/interval";
import 'rxjs/add/operator/startWith';
// import * as settings from 'electron-settings';

import { GlobalService } from './global.service';

import { WalletCreation } from '../classes/wallet-creation';
import { WalletRecovery } from '../classes/wallet-recovery';
import { WalletLoad } from '../classes/wallet-load';
import { WalletInfo } from '../classes/wallet-info';
import { Mnemonic } from '../classes/mnemonic';
import { FeeEstimation } from '../classes/fee-estimation';
import { TransactionBuilding } from '../classes/transaction-building';
import { TransactionSending } from '../classes/transaction-sending';

/**
 * For information on the API specification have a look at our swagger files located at http://localhost:5000/swagger/ when running the daemon
 */
@Injectable()
export class ApiService {
    constructor(private http: Http, private globalService: GlobalService) {};

    private headers = new Headers({'Content-Type': 'application/json'});
    private pollingInterval = 3000;
    // TODO: this URL need to come from config
    // private stratisApiUrl = settings.get('apiUrl');
    private stratisApiUrl = 'http://localhost:38221/api';

    /**
     * Gets available wallets at the default path
     */
    getWalletFiles(): Observable<any> {
      return this.http
        .get(this.stratisApiUrl + '/wallet/files')
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
        .get(this.stratisApiUrl + '/wallet/mnemonic', new RequestOptions({headers: this.headers, search: params}))
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

    getCoinDetails() : Observable<any> {
      return this.http
        .get(this.stratisApiUrl + '/sidechains/get-coindetails')
        .map((response: Response) => response);
    }

    /**
     * Get general wallet info from the API once.
     */
    getGeneralInfoOnce(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('Name', data.walletName);

      return this.http
        .get(this.stratisApiUrl + '/wallet/general-info', new RequestOptions({headers: this.headers, search: params}))
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
        .switchMap(() => this.http.get(this.stratisApiUrl + '/wallet/general-info', new RequestOptions({headers: this.headers, search: params})))
        .map((response: Response) => response);
    }

    /**
     * Get wallet balance info from the API.
     */
    getWalletBalance(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);

      return Observable
        .interval(this.pollingInterval)
        .startWith(0)
        .switchMap(() => this.http.get(this.stratisApiUrl + '/wallet/balance', new RequestOptions({headers: this.headers, search: params})))
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
        .get(this.stratisApiUrl + '/wallet/maxbalance', new RequestOptions({headers: this.headers, search: params}))
        .map((response: Response) => response);
    }

    /**
     * Get a wallets transaction history info from the API.
     */
    getWalletHistory(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);

      return Observable
        .interval(this.pollingInterval)
        .startWith(0)
        .switchMap(() => this.http.get(this.stratisApiUrl + '/wallet/history', new RequestOptions({headers: this.headers, search: params})))
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
        .get(this.stratisApiUrl + '/wallet/unusedaddress', new RequestOptions({headers: this.headers, search: params}))
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
        .get(this.stratisApiUrl + '/wallet/unusedaddresses', new RequestOptions({headers: this.headers, search: params}))
        .map((response: Response) => response);
    }

    /**
     * Get get all receive addresses for an account of a wallet from the API.
     */
    getAllReceiveAddresses(data: WalletInfo): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', "account 0"); //temporary

      return this.http
        .get(this.stratisApiUrl + '/wallet/addresses', new RequestOptions({headers: this.headers, search: params}))
        .map((response: Response) => response);
    }

    /**
     * Estimate the fee of a transaction
     */
    estimateFee(data: FeeEstimation): Observable<any> {
      let params: URLSearchParams = new URLSearchParams();
      params.set('walletName', data.walletName);
      params.set('accountName', data.accountName);
      params.set('destinationAddress', data.destinationAddress);
      params.set('amount', data.amount);
      params.set('feeType', data.feeType);
      params.set('allowUnconfirmed', "true");

      return this.http
        .get(this.stratisApiUrl + '/wallet/estimate-txfee', new RequestOptions({headers: this.headers, search: params}))
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

    /**
     * Start staking
     */
    startStaking(data: any): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/miner/startstaking', JSON.stringify(data), {headers: this.headers})
        .map((response: Response) => response);
    }

    /**
     * Get staking info
     */
    getStakingInfo(): Observable<any> {
      return Observable
        .interval(this.pollingInterval)
        .startWith(0)
        .switchMap(() => this.http.get(this.stratisApiUrl + '/miner/getstakinginfo'))
        .map((response: Response) => response);
    }

    /**
      * Stop staking
      */
    stopStaking(): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/miner/stopstaking', {headers: this.headers})
        .map((response: Response) => response);
    }

    /**
     * Send shutdown signal to the daemon
     */
    shutdownNode(): Observable<any> {
      return this.http
        .post(this.stratisApiUrl + '/node/shutdown', {headers: this.headers})
        .map((response: Response) => response);
    }
}
