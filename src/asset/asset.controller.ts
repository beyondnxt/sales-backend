import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/asset.dto';
import { Asset } from './entity/asset.entity';

@Controller('asset')
export class AssetController {
    constructor(
        private readonly assetService: AssetService
    ) { }

    @Post()
    async create(@Body() assetData: CreateAssetDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid']
            return await this.assetService.create(assetData, userId)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ data: any[], totalCount: number }> {
        try {
            return await this.assetService.findAll(page, limit);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Asset> {
        try {
            return await this.assetService.findOne(id)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() assetData: CreateAssetDto, @Req() req: Request): Promise<Asset> {
        try {
            const userId = req.headers['userid']
            return await this.assetService.update(id, assetData, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<any> {
        try {
            return await this.assetService.remove(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }
}
