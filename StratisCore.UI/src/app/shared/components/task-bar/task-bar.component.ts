import {
  Component,
  ComponentFactoryResolver,
  Input, OnDestroy,
  OnInit, Type,
  ViewChild
} from '@angular/core';
import { Animations } from '@shared/animations/animations';
import { TaskBarService } from '@shared/services/task-bar-service';
import { TaskBarItemHostDirective } from '@shared/components/task-bar/task-bar-item-host-directive';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

export interface TaskBarOptions {
  showCloseButton?: boolean;
  taskBarWidth?: any;
}

export interface TaskBarRef<T> {
  instance: T
  close(close?: Observable<boolean>): void;
}

export class TaskBarReference<T> implements TaskBarRef<T> {
  private subscription: Subscription;
  public onClosePromise : Promise<any>;
  constructor(private taskBar: ITaskBar, public instance: T) {
  }

  public close(obs?: Observable<boolean>): Promise<any> {
    this.onClosePromise = new Promise<any>((resolve) => {
      if (obs) {
        this.subscription = obs.subscribe(r => {
          if (r === true) {
            this.taskBar.close();
            this.subscription.unsubscribe();
            resolve(true)
          }
        })
      } else {
        this.taskBar.close();
        resolve(true)
      }
    });
    return this.onClosePromise;
  }

  public dispose(): void {
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }
}

export interface ITaskBar {
  opened: boolean;

  open<T>(component: Type<T>, data: any, taskBarOptions: TaskBarOptions): T

  close(): void;
}

@Component({
  selector: 'app-task-bar',
  templateUrl: './task-bar.component.html',
  styleUrls: ['./task-bar.component.scss'],
  animations: Animations.openClose
})
export class TaskBarComponent implements ITaskBar, OnInit, OnDestroy {

  @Input() opened: boolean;
  @ViewChild(TaskBarItemHostDirective, {static: false}) host: TaskBarItemHostDirective;
  public options: BehaviorSubject<TaskBarOptions> = new BehaviorSubject<TaskBarOptions>({});


  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private taskBarService: TaskBarService) {
    taskBarService.registerTaskBar(this);

  }

  public open<T>(component: Type<T>, data?: any, taskBarOptions?: TaskBarOptions): T {
    this.options.next(taskBarOptions || {});

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const viewContainerRef = this.host.viewContainerRef;
    viewContainerRef.clear();

    try {
      const componentRef = viewContainerRef.createComponent(componentFactory);
      if (data) {
        Object.keys(data).forEach(key => {
          componentRef.instance[key] = data[key];
        })
      }
      this.opened = true;
      return componentRef.instance as T;

    } catch (e) {
      console.log(e);
    }
    return null;
  }

  public close(): void {
    this.opened = false;
    setTimeout(() => {
      this.host.viewContainerRef.clear();
    }, 500)

  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.taskBarService.clearReferences()
  }
}
