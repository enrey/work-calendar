import { Injectable } from '@angular/core';
import { Employee } from './models/employee.model';
import { EmployeeStoreService } from './store/employee-store.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeRepositoryService {
  private employeeList: Employee[] = [
    {
      id: 1,
      name: 'Андрей',
      surname: 'Ковалев'
    },
    {
      id: 2,
      name: 'Климент',
      surname: 'Рудниченко'
    },
    {
      id: 3,
      name: 'Дмитрий',
      surname: 'Глотов'
    }
  ];

  constructor(private employeeStoreService: EmployeeStoreService) {}

  public loadEmployees() {
    this.employeeStoreService.addEmployees(this.employeeList);
  }
}
