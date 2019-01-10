import { browser } from 'protractor';

/* tslint:disable */
export class AngularElectronPage {
  navigateTo(route: string) {
    return browser.get(route);
  }

  getTitle() {
    let title: string;
    return browser.getTitle();
  }
}
