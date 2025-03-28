import { Component, inject, ViewChildren, AfterViewInit, ChangeDetectorRef, QueryList } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AppointmentComponent } from '../appointment/appointment.component';
import { Appointment } from '../../models/appointment';
import { AppointmentService } from '../../services/appointment/appointment.service';

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
    AppointmentComponent,
    DatePipe
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements AfterViewInit {
  private appointmentService = inject(AppointmentService);
  private cdRef = inject(ChangeDetectorRef);
  
  days: Date[] = [];
  appointments: Appointment[] = [];
  connectedDropLists: CdkDropList<any>[] = [];
  
  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;

  constructor() {
    this.generateWeekDays();
    this.loadAppointments();
  }

  ngAfterViewInit() {
    this.connectedDropLists = this.dropLists.toArray();
    this.cdRef.detectChanges();
  }

  generateWeekDays() {
    const today = new Date();
    this.days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
  }

  onAppointmentDeleted(id: string) {
    this.appointmentService.deleteAppointment(id).subscribe(() => {
      this.loadAppointments(); 
    });
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