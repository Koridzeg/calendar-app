import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
      path: 'calendar',
      loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent)
    },
    { path: '', redirectTo: 'calendar', pathMatch: 'full' }
  ];