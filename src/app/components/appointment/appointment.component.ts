import { Component, Input, Output, EventEmitter, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Appointment } from '../../models/appointment';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent implements OnDestroy {
  @Input() appointment!: Appointment;
  @Output() delete = new EventEmitter<string>();
  private destroy$ = new Subject<void>();
  private router = inject(Router);

  onDelete() {
    this.delete.emit(this.appointment.id);
  }

  onEdit() {
    this.router.navigate(['/appointment/edit', this.appointment.id]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}