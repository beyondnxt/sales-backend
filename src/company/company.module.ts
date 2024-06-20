import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { User } from 'src/user/entity/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Company, User])],
    providers: [CompanyService],
    controllers: [CompanyController]
  })
export class CompanyModule {}
