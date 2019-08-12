import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import "@aspnet/signalr";
import * as signalR from '@aspnet/signalr';
import { HttpClient } from "@angular/common/http";
import { ISignalRService } from "@shared/services/signalr-service.i";

export interface SignalRConnectionInfo {
  signalRUri: string;
  signalRPort: string;
}

@Injectable()
export class SignalRService implements ISignalRService {
  private connection: signalR.HubConnection;

  constructor(private http: HttpClient) {
  }

  public onConnectionFailed: EventEmitter<Error> = new EventEmitter<Error>();

  public connect(hubName: string, onEventMessageDelegate: (message: any) => void): void {
    this.getConnectionInfo().subscribe((con: SignalRConnectionInfo) => {

      if (this.connection && this.connection.state && this.connection.state != 4) {
        console.log('signlar connection abort');
        this.connection.stop();
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${con.signalRUri}:${con.signalRPort}/${hubName}-hub`, {})
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.on('receiveEvent', onEventMessageDelegate);

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

  public getConnectionInfo(): Observable<SignalRConnectionInfo> {
    return this.http.post<SignalRConnectionInfo>("getConnectionInfo", {});
  }
}
