import { TasksService } from './../shared/services/tasks.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Moment } from 'moment';
import { Observable } from 'rxjs';
import { TaskModel } from 'src/app/models/tasks.models';
import { DateConvertService } from 'src/app/shared/services/date-convert.service';
import { ContextStoreService } from 'src/app/store/context-store.service';
import { DayType } from './../shared/const/day-type.const';
import { TasksStoreService } from './../store/tasks-store.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { AppRoutingModule } from '../app-routing.module';
import { Employee } from '../models/employee.model';
import { TaskRepositoryService } from '../task-repository.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  constructor(
    private contextStoreService: ContextStoreService,
    private dateConvertService: DateConvertService,
    private tasksStoreService: TasksStoreService,
    private router: Router,
    private teaksService: TasksService,
    private taskRepositoryService: TaskRepositoryService
  ) {}

  @Input() task: TaskModel;
  @Output() selected = new EventEmitter<Moment>();

  selectedDate: NgbDateStruct;
  public tasks: TaskModel[];

  public hoveredDate: NgbDate;

  public fromDate: NgbDate;
  public toDate: NgbDate;

  currentDate$: Observable<Moment>;

  ngOnInit() {
    // TODO: Add Init per user
    // this.tasksStoreService.addTasks([
    //   {
    //     id: 1,
    //     type: DayType.SICK,
    //     date: moment().startOf('day')
    //   }
    // ]);

    //this.taskRepositoryService.loadTasks(this.contextStoreService.getSelectedUser());

    this.contextStoreService
      .getCurrentDate$()
      .subscribe(res => (this.selectedDate = this.dateConvertService.convertMomentToNgbDate(res)));

    this.tasksStoreService.getTasks$().subscribe(res => {
      this.tasks = res;
    });
  }

  onSwipe(evt) {
    const toRight = Math.abs(evt.deltaX) > 40 && evt.deltaX > 0;
    const increment = toRight === true ? -1 : 1;

    const nextRoute = AppRoutingModule.getNext(this.router, increment);
    this.router.navigate([nextRoute]);
  }

  public onDateSelect(date: NgbDateStruct) {
    this.selectedDate = date;
    const dt = this.dateConvertService.convertNgbDateToMoment(date);
    this.contextStoreService.setCurrentDate(dt);
    console.log('setting type ' + this.getDayType(dt));
    this.contextStoreService.setDayType(this.getDayType(dt));
  }

  dateHasTask(date: NgbDateStruct): boolean {
    const result = this.tasks.find(i => i.date.isSame(this.dateConvertService.convertNgbDateToMoment(date)));
    return !!result;
  }

  getDayType(dt: Moment): DayType {
    const existedTask = this.tasks.find(i => i.date.isSame(dt));

    let dayType = DayType.COMMON;

    if (existedTask) {
      dayType = existedTask.type;
    } else if (dt.weekday() === 5 || dt.weekday() === 6) {
      dayType = DayType.LEFT;
    }

    return dayType;
  }

  chooseClass(date: NgbDateStruct): string {
    const dt = this.dateConvertService.convertNgbDateToMoment(date);
    const dayType = DayType[this.getDayType(dt)];

    return `type_${dayType}`;
  }
}
