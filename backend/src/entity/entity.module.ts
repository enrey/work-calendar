import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobPosition } from './schemas/job-position.schemas';
import { ProjectSchema } from './schemas/projects.schemas';
import { TaskSchema } from './schemas/task.schemas';
import { UserSchema } from './schemas/user.schemas';

const mongoModule = MongooseModule.forFeature([
  { name: 'Users', schema: UserSchema },
  { name: 'JobPosition', schema: JobPosition },
  { name: 'Projects', schema: ProjectSchema },
  { name: 'Tasks', schema: TaskSchema },
]);

@Module({
  imports: [mongoModule],
  exports: [mongoModule],
})
export class EntityModule {}