import { Module } from '@nestjs/common';
import { Role } from 'src/role/entity/role.entity';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { LeaveRequest } from 'src/leave-request/entity/leave-request.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Role, LeaveRequest])],
    providers: [UserService],
    controllers: [UserController],
    exports:[UserService]
  })
export class UserModule {}
