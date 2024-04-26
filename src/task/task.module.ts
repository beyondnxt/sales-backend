import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entity/task.entity';
import { User } from 'src/user/entity/user.entity';
import { Role } from 'src/role/entity/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Role])],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TaskModule {}
