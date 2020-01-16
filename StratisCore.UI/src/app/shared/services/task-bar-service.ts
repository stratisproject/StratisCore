import { Injectable, Type } from '@angular/core';
import { ITaskBar, TaskBarOptions, TaskBarRef, TaskBarReference } from '@shared/components/task-bar/task-bar.component';

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

  public open<T>(component: Type<T>, data?: any, taskBarOptions?: TaskBarOptions): TaskBarRef<T> {
    if (this.taskBarOpen) {
      if (!(this.reference.instance instanceof component)) {
        this.close(false);
        setTimeout(() => this.openInternal(component, data, taskBarOptions), 550);
      }
      return;
    }
    this.openInternal(component, data, taskBarOptions)
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

  public close(closedByTaskBar?: boolean): void {
    if (!closedByTaskBar) {
      this.taskBar.close();
    }
    this.taskBarOpen = false;
    this.clearReferences();
  }

  public clearReferences(): void {
    if (this.reference) {
      this.reference.dispose();
      this.reference = null;
    }
  }
}
