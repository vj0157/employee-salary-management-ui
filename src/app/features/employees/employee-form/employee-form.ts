
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  EmployeeService,
  EmployeeRequest
} from '../../../core/services/employee.service';

import {
  SalaryService,
  SalaryResponse
} from '../../../core/services/salary.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css'
})
export class EmployeeForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly salaryService = inject(SalaryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  isEditMode = false;
  employeeId: number | null = null;

  submitting = false;
  loadingEmployee = false;

  // Salary properties
  loadingSalary = false;
  latestSalary: SalaryResponse | null = null;
  salaryError = '';

  successMessage = '';
  errorMessage = '';

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
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.employeeId = Number(id);

      if (!Number.isInteger(this.employeeId) || this.employeeId <= 0) {
        this.errorMessage = 'Invalid employee ID.';
        return;
      }

      this.loadEmployee(this.employeeId);
    }
  }

  get f() {
    return this.employeeForm.controls;
  }

  loadEmployee(id: number): void {
    this.loadingEmployee = true;
    this.errorMessage = '';

    this.employeeService.getEmployeeById(id).subscribe({
      next: (response) => {
        this.employeeForm.patchValue({
          employeeCode: response.data.employeeCode,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          country: response.data.country
        });

        this.loadingEmployee = false;

        // Load the employee's latest salary
        this.loadLatestSalary(id);

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Employee loading error:', error);

        this.errorMessage =
          error.error?.message || 'Unable to load employee details.';

        this.loadingEmployee = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadLatestSalary(employeeId: number): void {
    this.loadingSalary = true;
    this.salaryError = '';
    this.latestSalary = null;

    this.salaryService.getSalaryHistory(employeeId).subscribe({
      next: (response) => {
        const salaries = response.data || [];

        // Latest effective date first
        this.latestSalary = [...salaries].sort((a, b) =>
          new Date(b.effectiveDate).getTime() -
          new Date(a.effectiveDate).getTime()
        )[0] ?? null;

        this.loadingSalary = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Salary loading error:', error);

        this.salaryError =
          error.error?.message || 'Unable to load salary information.';

        this.loadingSalary = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const request: EmployeeRequest = this.employeeForm.getRawValue();

    this.submitting = true;

    const operation = this.isEditMode && this.employeeId !== null
      ? this.employeeService.updateEmployee(this.employeeId, request)
      : this.employeeService.createEmployee(request);

    operation.subscribe({
      next: (response) => {
        this.successMessage = response.message ||
          (this.isEditMode
            ? 'Employee updated successfully.'
            : 'Employee created successfully.');

        this.submitting = false;
        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/employees']);
        }, 1000);
      },

      error: (error) => {
        console.error('Employee save error:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to save employee. Please check the information and try again.';

        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
