import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from "rxjs";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GlobalService } from "@shared/services/global.service";
import { CurrentAccountService } from "@shared/services/current-account.service";

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  @Input() sideBarItems: SideBarItem[];

  constructor(private router: Router,
private modalService: NgbModal, private globalService: GlobalService, private currentAccountService: CurrentAccountService) 
{

    this.sideBarItems = [{
      selected: true,
      displayText: 'Account',
      visible: of(true),
      classes: ['side-bar-item', 'side-bar-item-icon', 'side-bar-item-account'],
      route: '/wallet/dashboard'
    }, {
      selected: false,
      displayText: 'Send',
      visible: of(true),
      classes: ['side-bar-item', 'side-bar-item-icon', 'side-bar-item-send'],
      route: '/wallet/send'
    }, {
      selected: false,
      displayText: 'Receive',
      visible: of(true),
      classes: ['side-bar-item', 'side-bar-item-icon', 'side-bar-item-receive'],
      route: '/wallet/receive'
    }, {
      selected: false,
      displayText: 'Staking',
      visible: of(true),
      classes: ['side-bar-item', 'side-bar-item-icon', 'side-bar-item-staking'],
      route: '/wallet/staking'
    }, {
      selected: false,
      displayText: 'Contacts',
      visible: of(true),
      classes: ['side-bar-item', 'side-bar-item-icon', 'side-bar-item-address'],
      route: '/wallet/address-book'
    }, {
      selected: false,
      displayText: 'Explorer',
      visible: of(true),
      classes: ['side-bar-item', 'side-bar-item-icon', 'side-bar-item-explorer'],
      route: '/address-book',
      disabled: true
    }, {
      selected: false,
      displayText: 'Advanced',
      visible: of(true),
      classes: ['side-bar-item', 'side-bar-item-icon', 'side-bar-item-advanced'],
      route: '/wallet/advanced'
    }]
  }

  public getClasses(sideBarItem: SideBarItem): any {
    let classObject: any = {};
    if (sideBarItem.classes) {
      sideBarItem.classes.forEach(c => {
        classObject[c] = true;
      });
      if (sideBarItem.selected) {
        classObject['selected'] = true;
      }
    }
    return classObject;
  }

  ngOnInit() {
  }

  onSelect(sideBarOption: SideBarItem) {
    if (!sideBarOption.disabled) {
      this.sideBarItems.forEach(item => {
        item.selected = (sideBarOption === item);
      });
      this.router.navigateByUrl(sideBarOption.route);
    }
  }

  public logout() :void {

  }
}

export interface SideBarItem {
  disabled?: boolean;
  iconClass?: any;
  selected: boolean;
  displayText: string;
  visible: Observable<boolean>;
  classes: string[];
  route: string;
}
