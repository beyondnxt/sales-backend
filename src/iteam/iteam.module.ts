import { Module } from '@nestjs/common';
import { IteamService } from './iteam.service';
import { IteamController } from './iteam.controller';

@Module({
  providers: [IteamService],
  controllers: [IteamController]
})
export class IteamModule {}
