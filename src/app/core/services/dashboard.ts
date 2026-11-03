
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface DashboardSummary {
  totalEmployees: number;
  totalCountries: number;
  employeesWithSalary: number;
}

export interface CountryDistribution {
  country: string;
  employeeCount: number;
}

export interface SalaryStatistics {
  currency: string;
  employeeCount: number;
  averageSalary: number;
  minimumSalary: number;
  maximumSalary: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/dashboard';

  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>(
      `${this.apiUrl}/summary`
    );
  }

  getCountryDistribution(): Observable<ApiResponse<CountryDistribution[]>> {
    return this.http.get<ApiResponse<CountryDistribution[]>>(
      `${this.apiUrl}/country-distribution`
    );
  }

  getSalaryStatistics(): Observable<ApiResponse<SalaryStatistics[]>> {
    return this.http.get<ApiResponse<SalaryStatistics[]>>(
      `${this.apiUrl}/salary-statistics`
    );
  }
}
