import { Injectable } from "@angular/core";
import { SideBarItem } from "@shared/components/side-bar/side-bar-item-base";

@Injectable({
  providedIn: 'root'
})
export class SideBarItems {
  private sideBarItems: SideBarItem[] = [];

  constructor() {
  }

  public getSideBarItems(): SideBarItem[] {
    return this.sideBarItems.sort((a, b) => b.order - a.order);
  }

  public registerSideBarItem(sidebarItem: SideBarItem) {
    if (!sidebarItem.order) {
      sidebarItem.order = SideBarItems.length
    }
    this.sideBarItems.push(sidebarItem);
  }

  public setSelected(index: number): void {
    this.sideBarItems.forEach((item, idx) => item.selected = idx == index);
  }

}
