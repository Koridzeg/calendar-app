import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Appointment } from '../../models/appointment';
import { AppointmentService } from '../appointment/appointment.service';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private destroy$ = new Subject<void>();
  private selectedDate$ = new BehaviorSubject<Date>(new Date());
  private appointmentService = inject(AppointmentService)
  private appointments$ = this.appointmentService.getAppointments();

  getCalendarData(): Observable<{ days: Date[]; appointments: Appointment[] }> {
    return combineLatest([this.selectedDate$, this.appointments$]).pipe(
      map(([selectedDate, appointments]) => ({
        days: this.generateMonthDays(selectedDate),
        appointments
      })),
      takeUntil(this.destroy$)
    );
  }

  setSelectedDate(date: Date): void {
    this.selectedDate$.next(date);
  }

  private generateMonthDays(date: Date): Date[] {
    const days: Date[] = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.unshift(new Date(year, month, -i));
    }
    
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i < (7 - lastDayOfWeek); i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}