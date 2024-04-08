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
import { ProductModule } from './product/product.module';
import { Product } from './product/entity/product.entity';
import { LeadModule } from './lead/lead.module';
import { Lead } from './lead/entity/lead.entity';
import { Order } from './order/entity/order.entity';
import { Expense } from './expense/entity/expense.entity';
import { ExpenseModule } from './expense/expense.module';
import { Company } from './company/entity/company.entity';
import { CompanyModule } from './company/company.module';

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
      entities: [User, Role, Attendance, Customer, Feedback, LeaveRequest, Product, Lead, Order, Expense, Company],
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
    ProductModule,
    LeadModule,
    ExpenseModule,
    CompanyModule
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
