import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import "@aspnet/signalr";
import * as signalR from '@aspnet/signalr';
import { HttpClient } from "@angular/common/http";
import { ISignalRService } from "@shared/services/interfaces/services.i";

export interface SignalRConnectionInfo {
  signalRUri: string;
  signalRPort: string;
}

export interface MessageHandler {
  messageType: string;
  onEventMessageDelegate: (message: any) => void
}

@Injectable({
  providedIn: "root"
})
export class SignalRService implements ISignalRService {
  private connection: signalR.HubConnection;
  private onMessageReceivedHandlers: Array<MessageHandler> = [];

  constructor(private http: HttpClient) {
    // TODO: consider multiple Hub support
    this.connect("events");
  }

  public registerOnMessageEventHandler(messageType: string, onEventMessageDelegate: (message: any) => void) {
    this.onMessageReceivedHandlers.push({
      messageType: messageType,
      onEventMessageDelegate: onEventMessageDelegate
    });
  }

  public onConnectionFailed: EventEmitter<Error> = new EventEmitter<Error>();

  public connect(hubName: string): void {
    this.getConnectionInfo().subscribe((con: SignalRConnectionInfo) => {

      if (this.connection && this.connection.state && this.connection.state != 4) {
        console.log('signlar connection abort');
        this.connection.stop();
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${con.signalRUri}:${con.signalRPort}/${hubName}-hub`, {})
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.on('receiveEvent', this.executeMessageDelegates);

      this.connection.onclose((error: Error) => {
        this.onConnectionFailed.emit(error);
        console.log(`disconnected ${error.message}`);
      });

      console.log("connecting...");

      this.connection.start()
        .then(() => {
          console.log("Connected!");
        })
        .catch(console.error);
    });
  }

  private executeMessageDelegates(message: any): void {
    this.onMessageReceivedHandlers.forEach(handler => {
      if (handler.messageType === message.messageType) {
        handler.onEventMessageDelegate(message);
      }
    });
  }

  public getConnectionInfo(): Observable<SignalRConnectionInfo> {
    return this.http.post<SignalRConnectionInfo>("getConnectionInfo", {});
  }
}
