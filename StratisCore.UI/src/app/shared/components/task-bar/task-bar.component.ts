import {
  Component,
  ComponentFactoryResolver,
  Input,
  OnInit, Type,
  ViewChild
} from '@angular/core';
import { Animations } from '@shared/animations/animations';
import { TaskBarService } from '@shared/services/task-bar-service';
import { TaskBarItemHostDirective } from '@shared/components/task-bar/task-bar-item-host-directive';
import { BehaviorSubject } from 'rxjs';

export interface TaskBarOptions {
  showCloseButton?: boolean;
  taskBarWidth?: any;
}

export interface ITaskBar {
  opened: boolean;

  open<T>(component: Type<T>, data: any, taskBarOptions: TaskBarOptions): T

  close(): void
}

@Component({
  selector: 'app-task-bar',
  templateUrl: './task-bar.component.html',
  styleUrls: ['./task-bar.component.scss'],
  animations: Animations.openClose
})
export class TaskBarComponent implements ITaskBar, OnInit {

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
}
