import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/startWith';

import { ElectronService } from 'ngx-electron';
import { GlobalService } from '../../../shared/services/global.service';
import { SidechainDetails } from '../models/sidechain-details';
/**
 * For information on the API specification have a look at our swagger files
 * located at http://localhost:38221/swagger/ when running the daemon
 */
@Injectable()
export class SidechainsService {
    constructor(
      private http: Http,
      private globalService: GlobalService,
      private electronService: ElectronService) {
      this.setApiPort();
    }

    private headers = new Headers({'Content-Type': 'application/json'});
    private pollingInterval = 3000;
    private apiPort;
    private stratisApiUrl;

    setApiPort() {
      this.apiPort = this.electronService.ipcRenderer.sendSync('get-port');
      this.stratisApiUrl = `http://localhost:${this.apiPort}/api`;
    }

    /**
     * Gets node status.
     */
    getNodeStatus(): Observable<any> {
      return this.http
        .get(`${this.stratisApiUrl}/node/status`)
        .map((response: Response) => response);
    }

    /**
     * Gets all available sidechains
     */
    getSidechains(): Observable<any> {
      return this.http
        .get(`${this.stratisApiUrl}/sidechains/list-sidechains`)
        .map((response: Response) => response);
     }

     /**
      * Get sidechain coin details
      */
    getCoinDetails(): Observable<any> {
      return this.http
        .get(`${this.stratisApiUrl}/sidechains/get-coindetails`)
        .map((response: Response) => response);
    }

    /**
     * Create a new sidechain.
     */
    create(data: SidechainDetails): Observable<any> {
      return this.http
        .post(`${this.stratisApiUrl}/sidechains/new-sidechain`, JSON.stringify(data), {headers: this.headers})
        .map((response: Response) => response);
    }
}
