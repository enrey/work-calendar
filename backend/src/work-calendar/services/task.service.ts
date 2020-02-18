import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskEntity } from '../../entity/entities/task.request.model';
import { SendMailService } from '../../mail/services/send-mail.service';
import { SendMailRequestModel } from '../../mail/models/send-mail.request.model';
import { UsersService } from './users.service';
import { FollowService } from './follow.service';
import { TaskModel } from '../models/task.model';
import { TaskType } from '../models/task-type.enum';
import * as moment from 'moment';
import { PresenceModel } from '../models/task-month.model';
import { WebPushService } from '../../web-push/services/web-push.service';
import { UserEntity } from '../../entity/entities/user.entity.model';

@Injectable()
export class TaskService {
  private readonly logger = new Logger('TaskService');

  constructor(
    @InjectModel('Tasks') private readonly taskModel: Model<TaskEntity>,
    private sendMailService: SendMailService,
    private userService: UsersService,
    private followService: FollowService,
    private webPushService: WebPushService
  ) {}

  async getTasks(): Promise<TaskEntity[]> {
    return await this.taskModel.find().exec();
  }

  async getTasksByAuthor(author: string): Promise<TaskEntity[]> {
    return await this.taskModel.find({ employeeCreated: author }).exec();
  }

  async getTasksByEmployee(employee: string): Promise<TaskEntity[]> {
    return await this.taskModel.find({ employee }).exec();
  }

  async udpdateOne(id: string, task: Partial<TaskModel>): Promise<TaskEntity> {
    await this.taskModel.findByIdAndUpdate(id, task);
    return await this.taskModel.findById(id);
  }

  async deleteById(id: string): Promise<TaskEntity> {
    return await this.taskModel.findByIdAndDelete(id);
  }

  async getTasksByMonth(date: string): Promise<PresenceModel[]> {
    const startOfMonth = moment(date)
      .clone()
      .startOf('month')
      .format('YYYY-MM-DD');
    const endOfMonth = moment(date)
      .clone()
      .endOf('month')
      .format('YYYY-MM-DD');

    const users = await this.userService.getUsers();
    // a >= start <= b  || a >= end <= b || start < a && end > b
    const tasks = await this.taskModel.find({
      $or: [
        {
          dateStart: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        },
        {
          dateEnd: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        },
        {
          $and: [
            {
              dateStart: {
                $lte: startOfMonth
              }
            },
            {
              dateEnd: {
                $gte: endOfMonth
              }
            }
          ]
        }
      ]
    });

    const result = users.map(employee => {
      const currentUserTasks = tasks.filter(i => i.employee === employee.mailNickname);
      const day = moment(date)
        .clone()
        .startOf('month');

      const res = {
        employee,
        tasks: []
      };

      while (day.isSameOrBefore(endOfMonth)) {
        const task = currentUserTasks
          .filter(i => {
            if (i.dateEnd) {
              return day.isBetween(moment(i.dateStart), moment(i.dateEnd), 'day', '[]');
            }

            return day.isSame(moment(i.dateStart), 'day');
          })
          .sort((a, b) => (moment(a.dtCreated).isAfter(moment(b.dtCreated)) ? -1 : 1));

        const lastTask = task[0] || { dateStart: day.format('YYYY-MM-DD') };

        res.tasks = [...res.tasks, lastTask];

        day.add(1, 'd');
      }
      return res;
    });
    return result;
  }

  async addTask(task: TaskModel): Promise<TaskEntity> {
    this.sendMail(task);
    this.sendPush(task);

    const { _id = null, ...newTask } = task;

    return await this.taskModel.create(newTask);
  }

  private async generateAddressArray(userSubject: UserEntity, userCreated: UserEntity): Promise<UserEntity[]> {
    const userFollowers = await this.followService.getUserFollowers(userSubject.id);
    let addressesArray = userFollowers;

    if (userSubject.id.toString() !== userCreated.id.toString()) {
      addressesArray = [...addressesArray, userSubject];
    }

    return addressesArray;
  }

  private async sendPush(task: TaskModel): Promise<void> {
    try {
      const userSubject = await this.userService.getUserByLogin(task.employee);
      const userCreated = await this.userService.getUserByLogin(task.employeeCreated);
      const addressesArray = (await this.generateAddressArray(userSubject, userCreated)).map(user => user.mailNickname);

      if (!addressesArray.length) {
        return;
      }

      let body = `Пользователь ${userCreated.username} изменил присутсвие на ${task.dateStart} для ${
        userSubject.username
      } на ${this.getTaskTypeName(task.type as TaskType)}`;

      if (task.dateEnd) {
        body = `Пользователь ${userCreated.username} изменил присутсвие c ${task.dateStart} по ${task.dateEnd} для ${
          userSubject.username
        } на ${this.getTaskTypeName(task.type as TaskType)}`;
      }

      const notification = {
        notification: {
          title: 'Изменение присутствия',
          body,
          icon: `https://calendar.it2g.ru/backend/avatar?login=${userSubject.mailNickname}`,
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now().toLocaleString(),
            primaryKey: 1
          },
          actions: [
            {
              action: 'explore',
              title: 'подробности'
            }
          ]
        }
      };

      const notifications = addressesArray.map(address =>
        this.webPushService.sendPushNotification(address, notification)
      );

      await Promise.all(notifications);
    } catch (e) {
      this.logger.error('Ошибка при отправке пуша', e.stack);
    }
  }

  private async sendMail(task: TaskModel): Promise<void> {
    try {
      const userSubject = await this.userService.getUserByLogin(task.employee);
      const userCreated = await this.userService.getUserByLogin(task.employeeCreated);
      const addressesArray = (await this.generateAddressArray(userSubject, userCreated)).map(user => user.email);

      if (!addressesArray.length) {
        return;
      }

      const mailData: SendMailRequestModel = {
        address: addressesArray,
        author: userCreated.username,
        date: task.dateStart,
        user: userSubject.username,
        status: this.getTaskTypeName(task.type as TaskType),
        comment: task.comment,
        dateEnd: task.dateEnd
      };

      await this.sendMailService.sendMail(mailData);
    } catch (e) {
      this.logger.error('Ошибка при отправке почты', e.stack);
    }
  }

  private getTaskTypeName(type: TaskType): string {
    const taskTypeMap = Object.freeze({
      [TaskType.COMMON]: 'Стандартно',
      [TaskType.CUSTOM]: 'Особое',
      [TaskType.LEFT]: 'Отсутствие',
      [TaskType.VACATION]: 'Отпуск',
      [TaskType.SICK]: 'Болезнь'
    });

    if (taskTypeMap[type]) {
      return taskTypeMap[type];
    }

    return 'Статус не определен';
  }
}
