import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Moment } from 'moment';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EmployeeStoreService } from '../../../core/store/employee-store.service';
import { TasksStoreService } from '../../../core/store/tasks-store.service';
import { DayType } from '../../../shared/const/day-type.const';
import { Employee } from '../../../shared/models/employee.model';
import { PresenceModel } from '../../../shared/models/presence.page.model';
import { TaskModel } from '../../../shared/models/tasks.models';

@Component({
  selector: 'app-team-presence',
  templateUrl: './team-presence-page.component.html',
  styleUrls: ['./team-presence-page.component.scss']
})
export class TeamPresencePageComponent implements OnInit, OnDestroy {
  public monthData$: Observable<PresenceModel[]>;
  public monthDays$: Observable<Moment[]>;
  public dayType = DayType;
  private qParamsSnpshotMonth = this.route.snapshot.queryParams.month;
  public date$ = new BehaviorSubject<Moment>(this.qParamsSnpshotMonth ? moment(this.qParamsSnpshotMonth) : moment());
  private employees$: Observable<Employee[]>;
  private tasks$: Observable<TaskModel[]>;
  private dateSub = new Subscription();

  constructor(
    private employeeStoreService: EmployeeStoreService,
    private tasksStoreService: TasksStoreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.employees$ = this.employeeStoreService.getEmployees();
    this.tasks$ = this.tasksStoreService.getTasks();
    this.monthDays$ = this.getMonthDays();
    this.updateTaskData();
    this.getQueryParamsDate();
  }

  ngOnDestroy() {
    this.dateSub.unsubscribe();
  }

  public prevMonth(): void {
    this.date$.next(moment(this.date$.value).subtract(1, 'months'));
  }

  public nextMonth(): void {
    this.date$.next(moment(this.date$.value).add(1, 'months'));
  }

  private getQueryParamsDate() {
    this.dateSub.add(
      this.date$.subscribe(date => {
        this.router.navigate([], { queryParams: { month: date.toISOString() } });
      })
    );
  }

  private getMonthDays(): Observable<Moment[]> {
    return this.date$.pipe(
      map(date => {
        const startOfMonth = date.clone().startOf('month');
        const endOfMonth = date.clone().endOf('month');

        const res: Moment[] = [];

        const day = startOfMonth;
        while (day.isBefore(endOfMonth)) {
          res.push(day.clone());
          day.add(1, 'd');
        }
        return res;
      })
    );
  }

  private updateTaskData(): void {
    this.monthData$ = combineLatest(this.date$, this.employees$, this.tasks$).pipe(
      filter(([_, employees, tasks]) => !!(employees && employees.length && tasks)),
      map(([date, employees, tasks]) =>
        employees.map(emp => {
          const startOfMonth = date.clone().startOf('month');
          const endOfMonth = date.clone().endOf('month');

          const res = {
            employee: emp,
            tasks: []
          };

          const day = startOfMonth;
          while (day.isBefore(endOfMonth)) {
            res.tasks.push(tasks.find(i => i.employee === emp.mailNickname && moment(day).isSame(i.dateStart, 'day')));
            day.add(1, 'd');
          }

          return res;
        })
      )
    );
  }
}