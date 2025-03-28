import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Appointment } from '../../models/appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  appointments$ = this.appointmentsSubject.asObservable();

  constructor() {
    // Initialize with some sample data
    const sampleAppointments: Appointment[] = [
      {
        id: '1',
        title: 'Team Meeting',
        description: 'Weekly team sync',
        date: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString()
      },
      {
        id: '2',
        title: 'Lunch',
        description: '',
        date: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(13, 30, 0, 0)).toISOString()
      }
    ];
    this.appointmentsSubject.next(sampleAppointments);
  }

  getAppointments(): Observable<Appointment[]> {
    return this.appointments$;
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    const current = this.appointmentsSubject.value;
    this.appointmentsSubject.next([...current, appointment]);
    return of(appointment);
  }

  updateAppointment(appointment: Appointment): Observable<Appointment> {
    const current = this.appointmentsSubject.value;
    const index = current.findIndex(a => a.id === appointment.id);
    if (index >= 0) {
      const updated = [...current];
      updated[index] = appointment;
      this.appointmentsSubject.next(updated);
    }
    return of(appointment);
  }

  deleteAppointment(id: string): Observable<void> {
    const current = this.appointmentsSubject.value;
    this.appointmentsSubject.next(current.filter(a => a.id !== id));
    return of(void 0);
  }
}