import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalaryManagement } from './salary-management';

describe('SalaryManagement', () => {
  let component: SalaryManagement;
  let fixture: ComponentFixture<SalaryManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(SalaryManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
