import { Component, ViewChildren, QueryList, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe, AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';
import { AppointmentComponent } from "../appointment/appointment.component";
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { Appointment } from '../../models/appointment';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { CalendarService } from '../../services/calendar/calendar.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CdkDropList,
    CdkDrag,
    MatDatepickerModule,
    MatNativeDateModule,
    AppointmentComponent,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    AsyncPipe,
    AppointmentFormComponent,
    DatePipe
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private calendarService = inject(CalendarService);
  private appointmentService = inject(AppointmentService);
  private dialog = inject(MatDialog);
  private cdRef = inject(ChangeDetectorRef);

  today = new Date();
  selectedDate = new Date();
  
  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;
  connectedDropLists: CdkDropList[] = [];

  calendarData$ = this.calendarService.getCalendarData();
  
  ngAfterViewInit() {
    this.connectedDropLists = this.dropLists.toArray();
    this.cdRef.detectChanges();
  }

  trackByDay(index: number, day: Date): string {
    return day.toISOString();
  }

  isToday(day: Date): boolean {
    return day.toDateString() === this.today.toDateString();
  }

  getAppointmentsForDay(day: Date, appointments: Appointment[]): Appointment[] {
    return appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate.toDateString() === day.toDateString();
    });
  }

  onMonthChanged(date: Date) {
    this.selectedDate = date;
    this.calendarService.setSelectedDate(date);
  }

  addAppointment(day: Date) {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '500px',
      data: { date: day }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.appointmentService.addAppointment(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe();
        }
      });
  }

  onAppointmentDeleted(id: string) {
    this.appointmentService.deleteAppointment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  drop(event: CdkDragDrop<Appointment[]>, day: Date) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const appointment = event.previousContainer.data[event.previousIndex];
      const newDate = new Date(day);
      
      const oldDate = new Date(appointment.date);
      newDate.setHours(oldDate.getHours(), oldDate.getMinutes());
      
      const updatedAppointment: Appointment = {
        ...appointment,
        date: newDate.toISOString(),
        endTime: this.adjustEndTime(oldDate, newDate, appointment.endTime)
      };
      
      this.appointmentService.updateAppointment(updatedAppointment)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
        });
    }
  }

  private adjustEndTime(oldStart: Date, newStart: Date, endTime: string): string {
    const oldEnd = new Date(endTime);
    const duration = oldEnd.getTime() - oldStart.getTime();
    return new Date(newStart.getTime() + duration).toISOString();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}