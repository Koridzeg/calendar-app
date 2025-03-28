import { Component, inject, ViewChildren, AfterViewInit, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Appointment } from '../../models/appointment';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { AppointmentComponent } from "../appointment/appointment.component";
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

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
    AppointmentFormComponent,
    DatePipe,
    MatDatepickerModule,
    MatNativeDateModule,
    AppointmentComponent,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,        // Add this

],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements AfterViewInit {
  private appointmentService = inject(AppointmentService);
  private dialog = inject(MatDialog);
  today = new Date();
  private cdRef = inject(ChangeDetectorRef);

  days: Date[] = [];
  appointments: Appointment[] = [];
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  selectedDate = new Date();
  
  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;
  connectedDropLists: CdkDropList[] = [];

  constructor() {
    this.generateMonthDays(this.selectedDate);
    this.loadAppointments();
  }

  ngAfterViewInit() {
    this.connectedDropLists = this.dropLists.toArray();
    this.cdRef.detectChanges();
  }

  isToday(day: Date): boolean {
    return day.toDateString() === this.today.toDateString();
  }

  generateMonthDays(date: Date) {
    this.days = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Generate all days in month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.days.push(new Date(year, month, i));
    }
    
    // Add padding days from previous month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      this.days.unshift(new Date(year, month, -i));
    }
    
    // Add padding days from next month
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i < (7 - lastDayOfWeek); i++) {
      this.days.push(new Date(year, month + 1, i));
    }
  }

  loadAppointments() {
    this.appointmentService.getAppointments().subscribe(appointments => {
      this.appointments = appointments;
    });
  }

  getAppointmentsForDay(day: Date): Appointment[] {
    return this.appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate.toDateString() === day.toDateString();
    });
  }

  onMonthChanged(event: any) {
    this.selectedDate = event;
    this.generateMonthDays(this.selectedDate);
  }

  addAppointment(day: Date) {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '500px',
      data: { date: day }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.addAppointment(result).subscribe(() => {
          this.loadAppointments();
        });
      }
    });
  }

  onAppointmentDeleted(id: string) {
    this.appointmentService.deleteAppointment(id).subscribe(() => {
      this.loadAppointments();
    });
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
      
      this.appointmentService.updateAppointment(updatedAppointment).subscribe(() => {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.appointments = [...this.appointments];
      });
    }
  }

  private adjustEndTime(oldStart: Date, newStart: Date, endTime: string): string {
    const oldEnd = new Date(endTime);
    const duration = oldEnd.getTime() - oldStart.getTime();
    return new Date(newStart.getTime() + duration).toISOString();
  }
}