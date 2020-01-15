import { Injectable, Type } from '@angular/core';
import { ITaskBar, TaskBarOptions } from '@shared/components/task-bar/task-bar.component';
import { Observable, Subscription } from 'rxjs';

export interface TaskBarRef<T> {
  instance: T
  closeOn(close?: Observable<boolean>): void;
}

export class TaskBarReference<T> implements TaskBarRef<T> {
  private subscription: Subscription;

  constructor(private taskBar: ITaskBar, public instance: T) {
  }

  public closeOn(obs: Observable<boolean>): void {
    this.subscription = obs.subscribe(r => {
      if (r === true) {
        this.taskBar.close();
        this.subscription.unsubscribe();
      }
    })
  }
}

@Injectable({
  providedIn: 'root'
})
export class TaskBarService {
  private taskBar: ITaskBar;

  public open<T>(component: Type<T>, data?: any, taskBarOptions? : TaskBarOptions): TaskBarRef<T> {
    const instance = this.taskBar.open(component, data, taskBarOptions);
    return new TaskBarReference(this.taskBar, instance);
  }

  public registerTaskBar(taskBar: ITaskBar): void {
    this.taskBar = taskBar;
  }

  public close(): void {
    if (this.taskBar.opened) {
      //    this.taskBar.close();
    }
  }
}
