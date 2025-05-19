import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  private readonly STORAGE_KEY = 'darkMode';
  private readonly DARK_CLASS = 'dark-theme';

  constructor() {
    this.initializeTheme();
  }

  isDarkMode(): Observable<boolean> {
    return this.darkMode.asObservable();
  }

  toggleDarkMode(): void {
    const newValue = !this.darkMode.value;
    this.darkMode.next(newValue);
    this.applyTheme(newValue);
    localStorage.setItem(this.STORAGE_KEY, String(newValue));
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    
    let useDarkMode: boolean;
    if (savedTheme) {
      useDarkMode = savedTheme === 'true';
    } else {
      useDarkMode = this.getSystemPreference();
    }
    
    this.darkMode.next(useDarkMode);
    this.applyTheme(useDarkMode);
  }

  private getSystemPreference(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    const action = isDark ? 'add' : 'remove';
    document.body.classList[action](this.DARK_CLASS);
  }
}