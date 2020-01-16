import { Directive, Input, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[taskBarItemHost]'
})
export class TaskBarItemHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) {
  }
}
