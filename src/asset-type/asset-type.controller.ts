import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req } from '@nestjs/common';
import { AssetType } from './entity/asset-type.entity';
import { AssetTypeService } from './asset-type.service';
import { CreateAssetTypeDto } from './dto/asset-type.dto';

@Controller('asset-type')
export class AssetTypeController {
    constructor(
        private readonly assetTypeService: AssetTypeService
    ) { }

    @Post()
    async create(@Body() assetTypeData: CreateAssetTypeDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid']
            return await this.assetTypeService.create(assetTypeData, userId)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10,
        @Query('name') name: string): Promise<{ data: any[], totalCount: number }> {
        try {
            return await this.assetTypeService.findAll(page, limit, name);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<AssetType> {
        try {
            return await this.assetTypeService.findOne(id)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Get('/all')
    async getName(): Promise<{ data: any[] }> {
        try {
            return await this.assetTypeService.getName();
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() assetTypeData: CreateAssetTypeDto, @Req() req: Request): Promise<AssetType> {
        try {
            const userId = req.headers['userid']
            return await this.assetTypeService.update(id, assetTypeData, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<any> {
        try {
            return await this.assetTypeService.remove(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
    }
}
