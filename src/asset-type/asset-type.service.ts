import { Injectable, NotFoundException } from '@nestjs/common';
import { AssetType } from './entity/asset-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateAssetTypeDto } from './dto/asset-type.dto';

@Injectable()
export class AssetTypeService {
    constructor(
        @InjectRepository(AssetType)
        private readonly assetTypeRepository: Repository<AssetType>
    ) { }

    async create(assetTypeData: CreateAssetTypeDto, userId: number): Promise<any> {
        const assetType = this.assetTypeRepository.create(assetTypeData);
        assetType.createdBy = userId
        return await this.assetTypeRepository.save(assetType);

    }

    async findAll(page: number | 'all' = 1, limit: number = 10, name: string): Promise<{ data: any[], fetchedCount: number, totalCount: number }> {
        const where: any = {};
        if (name) {
            where.name = Like(`%${name}%`);
        }
        let queryBuilder = this.assetTypeRepository.createQueryBuilder('assetType')
            .where('assetType.deleted = :deleted', { deleted: false })
            .andWhere(where);

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip).take(limit);
        }
        const [assetType, totalCount] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount()
        ]);
        return {
            data: assetType,
            fetchedCount: assetType.length,
            totalCount: totalCount
        };;
    }

    async findOne(id: number): Promise<AssetType> {
        const assetType = await this.assetTypeRepository.findOne({ where: { id, deleted: false } });
        if (!assetType) {
            throw new NotFoundException('Asset Type not found');
        }
        return assetType;
    }

    async getName(): Promise<{ data: any[] }> {
        const assetType = await this.assetTypeRepository.find({ where: { deleted: false } });
        return {
            data: assetType.map(assetType => ({
                id: assetType.id,
                name: assetType.name
            })),
        };
    }

    async update(id: number, assetTypeData: CreateAssetTypeDto, userId): Promise<AssetType> {
        try {
            const assetType = await this.assetTypeRepository.findOne({ where: { id, deleted: false } });
            if (!assetType) {
                throw new NotFoundException(`Asset type with ID ${id} not found`);
            }
            assetType.updatedBy = userId
            Object.assign(assetType, assetTypeData);
            return await this.assetTypeRepository.save(assetType);
        } catch (error) {
            throw new Error(`Unable to update asset type : ${error.message}`);
        }
    }

    async remove(id: number): Promise<any> {
        const existingAssetType = await this.assetTypeRepository.findOne({ where: { id, deleted: false } });
        if (!existingAssetType) {
            throw new NotFoundException(`Asset type with ID ${id} not found`);
        }
        existingAssetType.deleted = true
        await this.assetTypeRepository.save(existingAssetType);
        return { message: `Successfully deleted id ${id}` }
    }
}
