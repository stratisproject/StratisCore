import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _chain: 'mainchain' | 'sidechain';
  private _mode: BehaviorSubject<string> = new BehaviorSubject('light');
  public mode = this._mode.asObservable();

  constructor(private globalService: GlobalService) {
    // Set the current chain's value
    this._chain = this.globalService.getSidechainEnabled() ? 'sidechain' : 'mainchain';

    // Add the default theme classes to the body(ex. 'mainchain' and 'dark')
    document.body.classList.add(this._chain, this._mode.getValue());

    // Load the inital theme.
    this.loadThemeStyles(this._mode.getValue());
  }

  toggleTheme = (): void => {
    // Get the current light or dark mode
    const currentMode = this._mode.getValue();
    // Set the value of the new mode
    const newMode = currentMode === 'light' ? 'dark' : 'light';

    // load the theme and mode styles ex. mainchain-dark.css
    this.loadThemeStyles(newMode);
    // add the light or dark class to the body
    document.body.classList.add(newMode);
    // emit new mode to all observables watching
    this._mode.next(newMode);
    // remove the old mode
    document.body.classList.remove(currentMode);
  }

  private loadThemeStyles(mode): void {
    const name = `${this._chain}-${mode}`;
    const alreadyLoaded = !!document.getElementById(name);

    // Stop here if the stylesheet has already been loaded
    if (alreadyLoaded) return;

    // Add stylesheet to document.head
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.id = name;
    stylesheet.href = `${name}.css`;
    document.head.appendChild(stylesheet);
  }
}
