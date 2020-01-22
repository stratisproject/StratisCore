import { Injectable } from '@angular/core';
import { SideBarItem } from '@shared/components/side-bar/side-bar-item-base';

@Injectable({
  providedIn: 'root'
})
export class SideBarItemsProvider {
  private sideBarItems: SideBarItem[] = [];

  constructor() {
  }

  public getSideBarItems(): SideBarItem[] {
    return this.sideBarItems.sort((a, b) => a.order - b.order);
  }

  public findByRoute(route: string): SideBarItem {
    return this.sideBarItems.find(item => route.startsWith(item.route));
  }

  public registerSideBarItem(sidebarItem: SideBarItem): void {
    if (!sidebarItem.order) {
      sidebarItem.order = this.sideBarItems.length;
    }
    this.sideBarItems.push(sidebarItem);
  }

  public setSelected(sideBarItem: SideBarItem): void {
    this.sideBarItems.forEach((item) => item.selected = item.route === sideBarItem.route);
  }
}
