import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';
import { Appointment } from '../../models/appointment';
import { AppointmentService } from '../../services/appointment/appointment.service';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent {
  @Input() appointment!: Appointment;
  @Output() delete = new EventEmitter<string>();
  private dialog = inject(MatDialog);
  private appointmentService = inject(AppointmentService);

  onDelete() {
    this.delete.emit(this.appointment.id);
  }

  onEdit() {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '400px',
      data: { ...this.appointment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appointmentService.updateAppointment(result).subscribe();
      }
    });
  }
}