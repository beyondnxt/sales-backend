import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { User } from './user/entity/user.entity';
import { Role } from './role/entity/role.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationMiddleware } from './common/middleware/authentication.middleware';
import { RequestService } from './common/request.service';
import { Attendance } from './attendence/entity/attendence.entity';
import { AttendanceModule } from './attendence/attendance.module';
import { CustomerModule } from './customer/customer.module';
import { FeedbackModule } from './feedback/feedback.module';
import { LeaveRequestModule } from './leave-request/leave-request.module';
import { OrderModule } from './order/order.module';
import { Customer } from './customer/entity/customer.entity';
import { Feedback } from './feedback/entity/feedback.entity';
import { LeaveRequest } from './leave-request/entity/leave-request.entity';

@Module({
  imports: [ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Role,Attendance, Customer, Feedback, LeaveRequest],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    RoleModule,
    AttendanceModule,
    CustomerModule,
    FeedbackModule,
    LeaveRequestModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService, 
    RequestService
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).exclude(
      { path: 'auth/signup', method: RequestMethod.POST },
      { path: 'auth/signin', method: RequestMethod.POST },
      { path: 'auth/forgotPassword', method: RequestMethod.PUT },
      { path: 'auth/resetPasswordUsingId/:id', method: RequestMethod.PUT },
      { path: 'auth/email/changePassword', method: RequestMethod.POST },

    ).forRoutes('*');
  }
}
