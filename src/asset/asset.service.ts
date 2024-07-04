import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto } from './dto/asset.dto';
import { Asset } from './entity/asset.entity';

@Injectable()
export class AssetService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>
    ) { }

    async create(assetData: CreateAssetDto, userId: number): Promise<any> {
        const asset = this.assetRepository.create(assetData);
        asset.createdBy = userId
        return await this.assetRepository.save(asset);
    }

    async findAll(page: number | 'all' = 1, limit: number = 10): Promise<{ data: any[], fetchedCount: number, totalCount: number }> {
        const where: any = {}
        let queryBuilder = this.assetRepository.createQueryBuilder('asset')
            .where('asset.deleted = :deleted', { deleted: false })
            .leftJoinAndSelect('asset.assetType', 'assetType', 'assetType.deleted = :deleted', { deleted: false })
            .leftJoinAndSelect('asset.customer', 'customer', 'customer.deleted = :deleted', { deleted: false })
            .leftJoinAndSelect('asset.task', 'task', 'task.deleted = :deleted', { deleted: false })
            .andWhere(where);

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip).take(limit);
        }
        const [assetData, totalCount] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount()
        ]);
        return {
            data: assetData.map(asset => ({
                id: asset.id,
                assetTypeId: asset.assetTypeId,
                assetTypeName: asset.assetType.name,
                customerId: asset.customerId,
                customerName: asset.customer.name,
                taskId: asset.taskId,
                taskName: asset.task ? asset.task.taskType : null,
                dateOfCommissioning: asset.dateOfCommissioning,
                dateOfLastVisit: asset.dateOfLastVisit,
                followUpDate: asset.followUpDate,
                deleted: asset.deleted,
                createdOn: asset.createdOn,
                createdBy: asset.createdBy,
                updatedOn: asset.updatedOn,
                updatedBy: asset.updatedBy
            })),
            fetchedCount: assetData.length,
            totalCount: totalCount
        };
    }

    async findOne(id: number): Promise<Asset> {
        const asset = await this.assetRepository.findOne({ where: { id, deleted: false } });
        if (!asset) {
            throw new NotFoundException(`Asset with ID ${id} not found`);
        }
        return asset;
    }

    async update(id: number, assetData: CreateAssetDto, userId): Promise<Asset> {
        try {
            const asset = await this.assetRepository.findOne({ where: { id, deleted: false } });
            if (!asset) {
                throw new NotFoundException(`Asset with ID ${id} not found`);
            }
            asset.updatedBy = userId
            Object.assign(asset, assetData);
            return await this.assetRepository.save(asset);
        } catch (error) {
            throw new Error(`Unable to update asset  : ${error.message}`);
        }
    }

    async remove(id: number): Promise<any> {
        const existingAsset = await this.assetRepository.findOne({ where: { id, deleted: false } });
        if (!existingAsset) {
            throw new NotFoundException(`Asset with ID ${id} not found`);
        }
        existingAsset.deleted = true
        await this.assetRepository.save(existingAsset);
        return { message: `Successfully deleted id ${id}` }
    }
}
