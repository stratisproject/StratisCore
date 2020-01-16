import { Injectable, Type } from '@angular/core';
import { ITaskBar, TaskBarOptions, TaskBarRef, TaskBarReference } from '@shared/components/task-bar/task-bar.component';

@Injectable({
  providedIn: 'root'
})
export class TaskBarService {
  private taskBar: ITaskBar;
  private taskBarOpen = false;
  private references: TaskBarReference<any>[] = [];

  public get isOpen(): boolean {
    return this.taskBarOpen;
  }

  public open<T>(component: Type<T>, data?: any, taskBarOptions?: TaskBarOptions): TaskBarRef<T> {
    if (!this.taskBar.opened) {
      const instance = this.taskBar.open(component, data, taskBarOptions);
      const ref = new TaskBarReference(this.taskBar, instance);
      this.references.push(ref);
      this.taskBarOpen = true;
      return ref;
    }
  }

  public registerTaskBar(taskBar: ITaskBar): void {
    this.taskBar = taskBar;
  }

  public close(): void {
    if (this.taskBar.opened) {
      this.taskBarOpen = false;
      this.taskBar.close();
    }
  }

  public clearReferences(): void {
    this.references.forEach(ref => ref.dispose());
    this.references = [];
  }
}
