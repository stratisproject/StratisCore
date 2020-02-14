import { Subscription } from "rxjs";

export abstract class SideBarItemBase implements SideBarItem {

  protected subscriptions: Subscription[] = [];
  private classes = ['side-bar-item', 'side-bar-item-icon'];

  protected constructor(public displayText: string, public route: string, sideBarClasses?: string[], visible?: boolean) {
    if (sideBarClasses) {
      sideBarClasses.forEach(c => this.classes.push(c));
    }
    this.visible = null == visible ? true : visible;
  }

  public getClasses(): any {
    const classObject: any = {};

    this.classes.forEach(c => {
      classObject[c] = true;
    });

    this.getStatusClasses().forEach(c => {
      classObject[c] = true;
    });

    if (this.selected) {
      classObject['selected'] = true;
    }
    return classObject;
  }

  public dispose(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  protected abstract getStatusClasses(): string[];

  public getIndicatorClasses(): string[] {
    return [];
  }

  order: number;
  selected: boolean;
  visible: boolean;
  disabled?: boolean;
  iconClass?: any;
}

export class SimpleSideBarItem extends SideBarItemBase {
  constructor(displayText: string, route: string, sideBarClasses?: string[], visible?: true) {
    super(displayText, route, sideBarClasses, visible);
  }

  protected getStatusClasses(): string[] {
    return [];
  }
}

export interface SideBarItem {
  disabled?: boolean;
  iconClass?: any;
  selected: boolean;
  displayText: string;
  visible: boolean;

  getClasses(): any;
  getIndicatorClasses(): string[];

  route: string;
  order: number;


}
