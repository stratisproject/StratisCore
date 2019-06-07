import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _theme: BehaviorSubject<string> = new BehaviorSubject('light');
  public theme = this._theme.asObservable();

  constructor() { }

  toggleTheme = () => {
    const currentClass = this._theme.getValue();
    const newClass:string = currentClass === 'light' ? 'dark' : 'light';

    document.body.classList.add(newClass);
    document.body.classList.remove(currentClass);

    this._theme.next(newClass);
  }
}
