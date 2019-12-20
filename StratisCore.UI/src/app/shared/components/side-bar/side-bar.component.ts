import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SideBarItemsProvider } from '@shared/components/side-bar/side-bar-items-provider.service';
import { SideBarItem } from '@shared/components/side-bar/side-bar-item-base';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit, OnDestroy {
  @Input() sideBarItems: SideBarItem[];
  private subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private sidebarItemsProvider: SideBarItemsProvider,
    private router: Router) {
    this.sideBarItems = sidebarItemsProvider.getSideBarItems();
  }

  public ngOnInit(): void {
    this.subscriptions.push(this.activatedRoute.url.subscribe(route => {
      const url = this.router.url;
      const match = this.sidebarItemsProvider.findByRoute(url);
      if (match) {
        this.onSelect(match, true);
      }
    }));
  }

  public onSelect(sideBarOption: SideBarItem, suppressNavigate: boolean = false): void {
    if (!sideBarOption.disabled) {
      this.sidebarItemsProvider.setSelected(sideBarOption);
      if (!suppressNavigate) {
        this.router.navigateByUrl(sideBarOption.route);
      }
    }
  }

  public logout(): void {
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}


