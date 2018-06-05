import { Injectable } from '@angular/core';
import { AppConfig } from '../../app.config';

@Injectable()
export class Log {
    public static Logger: Log = new Log();

    static log(...args: any[]) {
        Log.Logger.log(...args);
    }

    static warn(...args: any[]) {
        Log.Logger.warn(...args);
    }

    static info(...args: any[]) {
        Log.Logger.info(...args);
    }

    static debug(...args: any[]) {
        Log.Logger.debug(...args);
    }

    static error(error: Error) {
        Log.Logger.error(error);
    }

    constructor() { }

    log(...args: any[]) {
        if (!AppConfig.production) {
            console.log(this.getLogPrefix(), 'background: #444; color: #fff', ...args);
        }
    }

    warn(...args: any[]) {
        if (!AppConfig.production) {
            args.push();
            console.warn(this.getLogPrefix(), 'background: #444; color: #fff', ...args);
        }
    }

    info(...args: any[]) {
        if (!AppConfig.production) {
            args.push();
            // tslint:disable-next-line:no-console
            console.info(this.getLogPrefix(), 'background: #444; color: #fff', ...args);
        }
    }

    debug(...args: any[]) {
        if (!AppConfig.production) {
            // tslint:disable-next-line:no-console
            console.debug(this.getLogPrefix(), 'background: #444; color: #fff', ...args);
        }
    }

    error(...args: any[]) {
        if (!AppConfig.production) {
            console.error(this.getLogPrefix(), 'background: #444; color: #fff', ...args);
        }
    }

    private getDateStamp(): string {
        return new Date().toTimeString();
    }

    private getLogPrefix(): string {
        return `%c [${this.getDateStamp()}] Breeze wallet:`;
    }
}
