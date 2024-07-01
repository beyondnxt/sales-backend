import { Module } from '@nestjs/common';
import { AssetTypeService } from './asset-type.service';
import { AssetTypeController } from './asset-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetType } from './entity/asset-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetType])],
  providers: [AssetTypeService],
  controllers: [AssetTypeController]
})
export class AssetTypeModule { }
