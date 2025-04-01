import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Appointment } from '../../models/appointment';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

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
    MatButtonModule,
  ],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css'],
})
export class AppointmentFormComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  isEditMode = false;
  appointmentId: string | null = null;

  form = this.fb.group({
    id: [''],
    title: ['', Validators.required],
    description: [''],
    date: [new Date(), Validators.required],
    startTime: ['09:00', Validators.required],
    endTime: ['10:00', Validators.required],
  });

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          if (params['id']) {
            this.isEditMode = true;
            this.appointmentId = params['id'];
            return this.appointmentService.getAppointment(params['id']);
          } else {
            const dateStr = params['date'];
            const date = dateStr ? new Date(dateStr) : new Date();
            this.form.patchValue({ date });
            return [];
          }
        })
      )
      .subscribe((appointment) => {
        if (appointment) {
          const date = new Date(appointment.date);
          this.form.patchValue({
            ...appointment,
            date: date,
            startTime: this.formatTime(date),
            endTime: appointment.endTime
              ? this.formatTime(new Date(appointment.endTime))
              : '10:00',
          });
        }
      });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const startDate = new Date(formValue.date!);
      const [startHours, startMinutes] = formValue
        .startTime!.split(':')
        .map(Number);

      startDate.setHours(startHours, startMinutes);

      const endDate = new Date(formValue.date!);
      const [endHours, endMinutes] = formValue.endTime!.split(':').map(Number);
      endDate.setHours(endHours, endMinutes);

      const appointment: Appointment = {
        id: formValue.id || this.generateId(),
        title: formValue.title!,
        description: formValue.description || '',
        date: startDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      const operation = this.isEditMode
        ? this.appointmentService.updateAppointment(appointment)
        : this.appointmentService.addAppointment(appointment);

      operation.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }

  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  cancelAppointment() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
