
import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RouterLink } from '@angular/router';
import { forkJoin, interval, Subscription } from 'rxjs';



import {
  EmployeeService,
  EmployeeRequest
} from '../../core/services/employee.service';
import { CountryDistribution, DashboardService, DashboardSummary, SalaryStatistics } from '../../core/services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  private readonly dashboardService = inject(DashboardService);
  private readonly employeeService = inject(EmployeeService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  private refreshSubscription?: Subscription;

  summary: DashboardSummary | null = null;
  countryDistribution: CountryDistribution[] = [];
  salaryStatistics: SalaryStatistics[] = [];

  loading = true;
  errorMessage = '';
  lastUpdated: Date | null = null;

  // Employee modal state
  showEmployeeModal = false;
  submittingEmployee = false;
  employeeSuccessMessage = '';
  employeeErrorMessage = '';

  employeeForm = this.fb.nonNullable.group({
    employeeCode: ['', [
      Validators.required,
      Validators.maxLength(50)
    ]],
    firstName: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    lastName: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(255)
    ]],
    country: ['', [
      Validators.required,
      Validators.maxLength(100)
    ]]
  });

  ngOnInit(): void {
    this.loadDashboard();

    // Refresh dashboard data every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadDashboard(false);
    });
  }

  get f() {
    return this.employeeForm.controls;
  }

  loadDashboard(showLoading = true): void {

    if (showLoading) {
      this.loading = true;
    }

    this.errorMessage = '';

    forkJoin({
      summary: this.dashboardService.getSummary(),
      countries: this.dashboardService.getCountryDistribution(),
      salaries: this.dashboardService.getSalaryStatistics()
    }).subscribe({
      next: (response) => {

        this.summary = response.summary.data;
        this.countryDistribution = response.countries.data;
        this.salaryStatistics = response.salaries.data;

        this.lastUpdated = new Date();
        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Dashboard API error:', error);

        this.loading = false;

        if (!this.summary) {
          this.errorMessage =
            'Unable to load dashboard data. Please check the backend connection.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  openEmployeeModal(): void {
    this.employeeForm.reset({
      employeeCode: '',
      firstName: '',
      lastName: '',
      email: '',
      country: ''
    });

    this.employeeSuccessMessage = '';
    this.employeeErrorMessage = '';
    this.submittingEmployee = false;
    this.showEmployeeModal = true;

    this.cdr.detectChanges();
  }

  closeEmployeeModal(): void {
    if (this.submittingEmployee) {
      return;
    }

    this.showEmployeeModal = false;
    this.employeeForm.reset();
    this.cdr.detectChanges();
  }

  submitEmployee(): void {

    this.employeeSuccessMessage = '';
    this.employeeErrorMessage = '';

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const request: EmployeeRequest = this.employeeForm.getRawValue();

    this.submittingEmployee = true;

    this.employeeService.createEmployee(request).subscribe({

      next: (response) => {

        this.submittingEmployee = false;
        this.employeeSuccessMessage =
          response.message || 'Employee created successfully.';

        this.cdr.detectChanges();

        // Close modal and reload dashboard after success
        setTimeout(() => {
          this.showEmployeeModal = false;
          this.employeeForm.reset();

          this.loadDashboard(false);
          this.cdr.detectChanges();
        }, 1000);
      },

      error: (error) => {

        console.error('Employee creation error:', error);

        this.submittingEmployee = false;

        this.employeeErrorMessage =
          error.error?.message ||
          'Unable to create employee. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }
}
