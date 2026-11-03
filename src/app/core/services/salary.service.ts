
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalaryRequest {
  baseSalary: number;
  bonus: number;
  currency: string;
  effectiveDate: string;
}

export interface SalaryResponse {
  id: number;
  employeeId: number;
  baseSalary: number;
  bonus: number;
  totalCompensation: number;
  currency: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalaryService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';

  getSalaryHistory(
    employeeId: number
  ): Observable<SalaryApiResponse<SalaryResponse[]>> {
    return this.http.get<SalaryApiResponse<SalaryResponse[]>>(
      `${this.apiUrl}/employees/${employeeId}/salaries`
    );
  }

  createSalary(
    employeeId: number,
    request: SalaryRequest
  ): Observable<SalaryApiResponse<SalaryResponse>> {
    return this.http.post<SalaryApiResponse<SalaryResponse>>(
      `${this.apiUrl}/employees/${employeeId}/salaries`,
      request
    );
  }

  updateSalary(
    salaryId: number,
    request: SalaryRequest
  ): Observable<SalaryApiResponse<SalaryResponse>> {
    return this.http.put<SalaryApiResponse<SalaryResponse>>(
      `${this.apiUrl}/salaries/${salaryId}`,
      request
    );
  }

  deleteSalary(
    salaryId: number
  ): Observable<SalaryApiResponse<void>> {
    return this.http.delete<SalaryApiResponse<void>>(
      `${this.apiUrl}/salaries/${salaryId}`
    );
  }
}
