import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { SideBarItems } from "@shared/components/side-bar/side-bar-items";
import { SideBarItem } from "@shared/components/side-bar/side-bar-item-base";

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  @Input() sideBarItems: SideBarItem[];

  constructor(
    private sidebarItems: SideBarItems,
    private router: Router) {
    this.sideBarItems = sidebarItems.getSideBarItems();
  }

  public ngOnInit(): void {
  }

  public onSelect(sideBarOption: SideBarItem): void {
    if (!sideBarOption.disabled) {
      this.sideBarItems.forEach(item => {
        item.selected = (sideBarOption === item);
      });
      this.router.navigateByUrl(sideBarOption.route);
    }
  }

  public logout(): void {
  }
}


