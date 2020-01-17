import {
  Component,
  ComponentFactoryResolver, EventEmitter,
  Input, OnDestroy,
  OnInit, Type,
  ViewChild
} from '@angular/core';
import { Animations } from '@shared/animations/animations';
import { ITaskBar, TaskBarOptions, TaskBarService } from '@shared/services/task-bar-service';
import { TaskBarItemHostDirective } from '@shared/components/task-bar/task-bar-item-host-directive';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

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
  private closedComplete = new EventEmitter<Boolean>();

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

  public animationComplete($event: any): void {
    if ($event.toState === 'closed') {
      this.closedComplete.emit(true);
    }
  }

  public close(): Promise<any> {
   this.opened = false;
    return new Promise<any>(resolve => {
      const sub = this.closedComplete.subscribe(closed => {
        this.host.viewContainerRef.clear();
        this.taskBarService.markAsClosed();
        sub.unsubscribe();
        resolve();
      });
    });
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.taskBarService.clearReference()
  }
}
