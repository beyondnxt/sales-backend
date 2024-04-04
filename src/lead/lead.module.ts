import { Module } from '@nestjs/common';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entity/lead.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead])],
  providers: [LeadService],
  controllers: [LeadController]
})
export class LeadModule {}
