import { EmployeeStoreService } from './store/employee-store.service';
import { ContextStoreService } from 'src/app/store/context-store.service';
import { EmployeeRepositoryService } from './employee-repository.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'work-calendar';

  constructor(
    private employeeRepositoryService: EmployeeRepositoryService,
    private employeeStoreService: EmployeeStoreService,
    private сontextStoreService: ContextStoreService
  ) {}

  ngOnInit(): void {
    this.employeeRepositoryService.loadEmployees();
    this.employeeStoreService.employees$
      .subscribe(res => {
        this.сontextStoreService.setCurrentUser(res[0]);
      })
      .unsubscribe();
  }
}
