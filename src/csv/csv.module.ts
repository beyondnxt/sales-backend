import { Module } from '@nestjs/common';
import { SqlService } from './csv.service';
import { sqlController } from './csv.controller';

@Module({
  controllers: [sqlController],
  providers: [SqlService]
})
export class csvModule {}
