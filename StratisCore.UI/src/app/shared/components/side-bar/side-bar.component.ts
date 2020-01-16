import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SideBarItemsProvider } from '@shared/components/side-bar/side-bar-items-provider.service';
import { SideBarItem } from '@shared/components/side-bar/side-bar-item-base';
import { Subscription } from 'rxjs';
import { TaskBarService } from '@shared/services/task-bar-service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit, OnDestroy {
  @Input() sideBarItems: SideBarItem[];
  private subscriptions: Subscription[] = [];

  constructor(
    private taskBarService: TaskBarService,
    private activatedRoute: ActivatedRoute,
    private sidebarItemsProvider: SideBarItemsProvider,
    private router: Router) {
    this.sideBarItems = sidebarItemsProvider.getSideBarItems();
  }

  public ngOnInit(): void {
    this.subscriptions.push(this.activatedRoute.url.subscribe(() => {
      const url = this.router.url;
      const match = this.sidebarItemsProvider.findByRoute(url);
      if (match) {
        this.onSelect(match, true);
      }
    }));
  }

  public onSelect(sideBarOption: SideBarItem, suppressNavigate = false): void {
    if (this.taskBarService.isOpen) {
      this.taskBarService.close();
    }

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


