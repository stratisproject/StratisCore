import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { SignalRService } from '@shared/services/signalr-service';
import { WalletInfo } from '@shared/models/wallet-info';
import {
  GeneralInfo,
} from '@shared/services/interfaces/api.i';
import {
  BlockConnectedSignalREvent,
  SignalREvents,
  WalletInfoSignalREvent
} from '@shared/services/interfaces/signalr-events.i';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { ErrorService } from '@shared/services/error-service';

@Injectable({
  providedIn: 'root'
})
export class NodeService extends RestApi {
  private generalInfoSubject: BehaviorSubject<GeneralInfo> = new BehaviorSubject<GeneralInfo>({
    walletName: '',
    walletFilePath: '',
    network: '',
    creationTime: '',
    isDecrypted: false,
    lastBlockSyncedHeight: 0,
    chainTip: 0,
    isChainSynced: false,
    connectedNodes: 0
  });

  private currentWallet: WalletInfo;

  constructor(
    globalService: GlobalService,
    http: HttpClient,
    errorService: ErrorService,
    signalRService: SignalRService) {
    super(globalService, http, errorService);

    globalService.currentWallet.subscribe(wallet => {
      this.currentWallet = wallet;
      this.updateGeneralInfoForCurrentWallet();
    });

    signalRService.registerOnMessageEventHandler<WalletInfoSignalREvent>(
      SignalREvents.WalletGeneralInfo, (message) => {
        if (message.walletName === this.currentWallet.walletName) {
          this.generalInfoSubject.next(message);
        }
      });

    // Update the GeneralInfo Subject when a new block is connected
    // This feels a little weak as we could un-sync? + Other properties we don't update
    // So maybe we should just get all the data once in a while?
    signalRService.registerOnMessageEventHandler<BlockConnectedSignalREvent>(SignalREvents.BlockConnected,
      (message) => {
        const generalInfo = this.generalInfoSubject.value;

        if (generalInfo.isChainSynced) {
          if (generalInfo.chainTip < message.height) {
            this.patchAndUpdateGeneralInfo({
              chainTip: message.height,
              lastBlockSyncedHeight: message.height
            });
          }
        }
      });
  }

  public generalInfo(): Observable<GeneralInfo> {
    return this.generalInfoSubject.asObservable();
  }

  private updateGeneralInfoForCurrentWallet(): void {
    const params = new HttpParams().set('Name', this.currentWallet.walletName);

    this.get<GeneralInfo>('wallet/general-info', params).pipe(
      catchError(err => this.handleHttpError(err)))
      .toPromise().then(generalInfo => {
      this.generalInfoSubject.next(generalInfo);
    });
  }

  private patchAndUpdateGeneralInfo(patch: any) {
    const updatedGeneralInfo = {} as GeneralInfo;

    Object.assign(updatedGeneralInfo, this.generalInfoSubject.value);
    Object.assign(updatedGeneralInfo, patch);

    this.generalInfoSubject.next(updatedGeneralInfo);
  }
}
