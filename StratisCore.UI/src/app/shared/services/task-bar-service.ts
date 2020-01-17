import { Injectable, Type } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

export interface TaskBarOptions {
  showCloseButton?: boolean;
  taskBarWidth?: any;
  title?: string;
}

export interface ITaskBar {
  opened: boolean;

  open<T>(component: Type<T>, data: any, taskBarOptions: TaskBarOptions): T

  close(): Promise<any>;
}

export interface TaskBarRef<T> {
  instance: T

  closeWhen(close?: Observable<boolean>): void;
}

export class TaskBarReference<T> implements TaskBarRef<T> {
  private subscription: Subscription;

  constructor(private taskBar: ITaskBar, public instance: T) {
  }

  public closeWhen(observable?: Observable<boolean>): void {
    if (observable) {
      this.subscription = observable.subscribe(response => {
        if (response === true) {
          this.taskBar.close();
          this.subscription.unsubscribe();
        }
      });
    }
  }

  public dispose(): void {
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class TaskBarService {
  private taskBar: ITaskBar;
  private taskBarOpen = false;
  private reference: TaskBarReference<any> = null;

  public get isOpen(): boolean {
    return this.taskBarOpen;
  }

  public open<T>(component: Type<T>, data?: any, taskBarOptions?: TaskBarOptions): Promise<TaskBarRef<T>> {
    return new Promise(((resolve, reject) => {
      if (this.taskBarOpen) {
        if (!(this.reference.instance instanceof component)) {
          this.close().then(() => {
            resolve(this.openInternal(component, data, taskBarOptions));
          });
          return;
        }
        reject(new Error('Task bar is already open'));
        return;
      }
      resolve(this.openInternal(component, data, taskBarOptions));
      return;
    }));
  }

  private openInternal<T>(component: Type<T>, data?: any, taskBarOptions?: TaskBarOptions): TaskBarRef<T> {
    if (!this.taskBarOpen) {
      const instance = this.taskBar.open(component, data, taskBarOptions);
      this.reference = new TaskBarReference(this.taskBar, instance);
      this.taskBarOpen = true;
      return this.reference;
    }
  }

  public registerTaskBar(taskBar: ITaskBar): void {
    this.taskBar = taskBar;
  }

  public markAsClosed(): void {
    this.taskBarOpen = false;
    this.clearReference();
  }

  public close(): Promise<any> {
    this.markAsClosed();
    return this.taskBar.close();
  }

  public clearReference(): void {
    if (this.reference) {
      this.reference.dispose();
      this.reference = null;
    }
  }
}
