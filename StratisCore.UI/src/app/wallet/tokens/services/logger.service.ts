import { Injectable } from '@angular/core';
import { AppConfig } from 'src/environments/environment';

@Injectable()
export class Log {
  public static Logger: Log = new Log();

  static log(...args: any[]): void {
    Log.Logger.log(...args);
  }

  static warn(...args: any[]): void {
    Log.Logger.warn(...args);
  }

  static info(...args: any[]): void {
    Log.Logger.info(...args);
  }

  static debug(...args: any[]): void {
    Log.Logger.debug(...args);
  }

  static error(error: Error): void {
    Log.Logger.error(error);
  }

  constructor() { }

  log(...args: any[]): void {
    this.consoleLog('log', ...args);
  }

  warn(...args: any[]): void {
    this.consoleLog('warn', ...args);
  }

  info(...args: any[]): void {
    this.consoleLog('info', ...args);
  }

  debug(...args: any[]): void {
    this.consoleLog('debug', ...args);
  }

  error(...args: any[]): void {
    this.consoleLog('error', ...args);
  }

  private get logToConsole(): boolean {
    return AppConfig.environment === 'LOCAL' && !!console;
  }

  private consoleLog(level: string, ...args: any[]): void {
    if (this.logToConsole) {
      this.getLogFunction(level)(
        this.getLogPrefix(),
        'background: #444; color: #fff',
        ...args
      );
    }
  }

  private getDateStamp(): string {
    return new Date().toLocaleString();
  }

  private getLogPrefix(): string {
    return `%c [${this.getDateStamp()}] Stratis Core:`;
  }

  private getLogFunction(level: string): (message?: any, ...optionalParams: any[]) => void {
    return console[level] || console.log;
  }
}
