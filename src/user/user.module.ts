import { Module } from '@nestjs/common';
import { Role } from 'src/role/entity/role.entity';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { LeaveRequest } from 'src/leave-request/entity/leave-request.entity';
import { Team } from 'src/team/entity/team.entity';
import { Task } from 'src/task/entity/task.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Role, LeaveRequest, Team, Task])],
    providers: [UserService],
    controllers: [UserController],
    exports:[UserService]
  })
export class UserModule {}
