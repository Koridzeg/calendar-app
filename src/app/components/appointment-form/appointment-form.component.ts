import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Appointment } from '../../models/appointment';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css']
})
export class AppointmentFormComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AppointmentFormComponent>);

  form = this.fb.group({
    id: [''],
    title: ['', Validators.required],
    description: [''],
    date: [new Date(), Validators.required],
    startTime: ['09:00', Validators.required],
    endTime: ['10:00', Validators.required]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: Appointment) {
    if (data) {
      const date = new Date(data.date);
      this.form.patchValue({
        ...data,
        date: date,
        startTime: this.formatTime(date),
        endTime: data.endTime ? this.formatTime(new Date(data.endTime)) : '10:00'
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const startDate = new Date(formValue.date!);
      const [startHours, startMinutes] = formValue.startTime!.split(':').map(Number);
      
      startDate.setHours(startHours, startMinutes);
      
      const endDate = new Date(formValue.date!);
      const [endHours, endMinutes] = formValue.endTime!.split(':').map(Number);
      endDate.setHours(endHours, endMinutes);
      
      const appointment: Appointment = {
        id: formValue.id || this.generateId(),
        title: formValue.title!,
        description: formValue.description || '',
        date: startDate.toISOString(),
        endTime: endDate.toISOString()
      };
      
      this.dialogRef.close(appointment);
    }
  }

  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}