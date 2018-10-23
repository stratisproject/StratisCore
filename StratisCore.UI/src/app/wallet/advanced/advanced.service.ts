import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import 'rxjs/add/observable/empty';

import { GlobalService } from '../../shared/services/global.service';
import { ElectronService } from 'ngx-electron';

class dateRequest {
    constructor(public date: Date){}
}

@Injectable()
export class AdvancedService {
    private urlPrefix = '';
    private readonly walletName;
    private readonly accountName = 'account 0';
    private headers = new HttpHeaders({'Content-Type': 'application/json'});

    constructor(private httpClient: HttpClient, private globalService: GlobalService, private electronService: ElectronService) { 
        this.walletName = this.globalService.getWalletName();
        this.urlPrefix = `http://localhost:${electronService.ipcRenderer.sendSync('get-port')}/api/Wallet/`;
    }

    public getExtPubKey(): Observable<string> {
        const url = this.makeUrl(`extpubkey?WalletName=${this.walletName}&AccountName=${this.accountName}`);
        return this.httpClient.get(url).map(x => x.toString());
    }

    public generateAddresses(count: number): Observable<string[]> {
        const url = this.makeUrl(`unusedaddresses?WalletName=${this.walletName}&AccountName=${this.accountName}&Count=${count}`);
        return this.httpClient.get(url).map(x => this.processAddresses(x));
    }

    public resyncFromDate(date: Date): Observable<any> {
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate()); //<- Strip any time values
        const url = this.makeUrl('syncfromdate');
        const data = JSON.stringify(new dateRequest(date));
        return this.httpClient.post(url, data, {headers: this.headers}).map((x: Response) => x);
    }

    private processAddresses(response: any): string[] {
        const addresses = new Array<string>();
        for (const address of response) {
            addresses.push(address);
        } 
        return addresses;
    }

    private makeUrl(urlPostfix: string): string {
        return `${this.urlPrefix}${urlPostfix}`;
    }
}
