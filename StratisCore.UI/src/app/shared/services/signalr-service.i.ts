export interface ISignalRService {
  connect(hubName: string, newMessageHandler: (message: any) => void): void;
}
