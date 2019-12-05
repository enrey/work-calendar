import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobPositionSchema } from './schemas/job-position.schemas';
import { ProjectSchema } from './schemas/project.schemas';
import { SubdivisionSchema } from './schemas/subdivision.schemas';
import { TaskSchema } from './schemas/task.schemas';
import { UserSchema } from './schemas/user.schemas';

const mongoModule = MongooseModule.forFeature([
  { name: 'Users', schema: UserSchema },
  { name: 'JobPosition', schema: JobPositionSchema },
  { name: 'Project', schema: ProjectSchema },
  { name: 'Tasks', schema: TaskSchema },
  { name: 'Subdivision', schema: SubdivisionSchema },
]);

@Module({
  imports: [mongoModule],
  exports: [mongoModule],
})
export class EntityModule {}
