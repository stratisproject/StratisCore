import { EventEmitter, Injectable } from '@angular/core';
import "@aspnet/signalr";
import * as signalR from '@aspnet/signalr';
import { HttpClient } from "@angular/common/http";
import { ISignalRService } from "@shared/services/interfaces/services.i";
import { GlobalService } from "@shared/services/global.service";
import { RestApi } from "@shared/services/rest-api";
import { ErrorService } from "@shared/services/error-service";
import { interval, Observable, Subscription } from "rxjs";
import { tap } from "rxjs/operators";

export interface SignalRConnectionInfo {
  signalRUri: string;
  signalRPort: string;
}

export interface SignalRMessageHandler {
  messageType: string;
  onEventMessageDelegate: (message: any) => void
}

@Injectable({
  providedIn: "root"
})
export class SignalRService extends RestApi implements ISignalRService {
  private connection: signalR.HubConnection;
  private onMessageReceivedHandlers: Array<SignalRMessageHandler> = [];
  private connecting: boolean = false;
  private connectSubscription: Subscription;
  private connectInterval: Observable<number> = interval(10000).pipe(tap(() => {
    // TODO: consider multiple Hub support
    this.connect("events");
  }));

  constructor(http: HttpClient,
              globalService: GlobalService,
              errorService: ErrorService) {
    super(globalService, http, errorService);
    this.connectToSignalR();
  }

  public registerOnMessageEventHandler<TMessage>(messageType: string, onEventMessageReceivedHandler: (message: TMessage) => void): void {
    this.onMessageReceivedHandlers.push({
      messageType: messageType,
      onEventMessageDelegate: onEventMessageReceivedHandler
    });
  }

  public onConnectionFailed: EventEmitter<Error> = new EventEmitter<Error>();

  public connect(hubName: string): void {
    this.getConnectionInfo().then((con: SignalRConnectionInfo) => {

      if (this.connection && this.connection.state && this.connection.state != 4) {
        console.log('signalR connection abort');
        this.connection.stop();
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${con.signalRUri}/${hubName}-hub`, {})
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.on('receiveEvent',
        (message) => {
          try {
            this.executeMessageReceivedHandlers(message)
          } catch (e) {
            this.errorService.handleError(e, true);
          }
        });

      this.connection.onclose((error: Error) => {
        this.onConnectionFailed.emit(error);
        console.log(`disconnected ${error.message}`);
        this.connectToSignalR();
      });

      console.log("connecting...");

      this.connection.start()
        .then(() => {
          this.markAsConnected();
        })
        .catch(console.error);
    });
  }

  private executeMessageReceivedHandlers(message: any): void {
    this.onMessageReceivedHandlers.forEach(handler => {
      if (message.nodeEventType) {
        const typeParts = message.nodeEventType.split(',');
        if (typeParts[0].endsWith(handler.messageType)) {
          handler.onEventMessageDelegate(message);
        }
      }
    });
  }

  private markAsConnected(): void {
    console.log("Connected!");
    if (this.connectSubscription) {
      this.connectSubscription.unsubscribe();
      this.connectSubscription = null;
      this.connecting = false;
    }
  }

  private connectToSignalR(): void {
    if (!this.connecting) {
      this.connecting = true;
      this.connectSubscription = this.connectInterval.subscribe();
    }
  }


  private getConnectionInfo(): Promise<SignalRConnectionInfo> {
    return this.get<SignalRConnectionInfo>("signalR/getConnectionInfo")
      .toPromise();
  }
}
