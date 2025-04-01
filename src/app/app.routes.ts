import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/calendar/calendar.component').then(
        (m) => m.CalendarComponent
      ),
  },
  {
    path: 'appointment',
    children: [
      {
        path: 'new/:date',
        loadComponent: () =>
          import(
            './components/appointment-form/appointment-form.component'
          ).then((m) => m.AppointmentFormComponent),
      },
      {
        path: 'edit/:id',
        loadComponent: () =>
          import(
            './components/appointment-form/appointment-form.component'
          ).then((m) => m.AppointmentFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
