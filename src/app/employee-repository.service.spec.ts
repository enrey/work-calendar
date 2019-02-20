import { TestBed } from '@angular/core/testing';

import { EmployeeRepositoryService } from './employee-repository.service';

describe('EmployeeRepositoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EmployeeRepositoryService = TestBed.get(EmployeeRepositoryService);
    expect(service).toBeTruthy();
  });
});
