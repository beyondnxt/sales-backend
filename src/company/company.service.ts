import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/company.dto';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async create(companyData: CreateCompanyDto, userId: number): Promise<any> {
        const { latitude, longitude, ...rest } = companyData;
        const location = `${latitude},${longitude}`;
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        const company = this.companyRepository.create({
            ...rest,
            location,
            createdBy: {
                userId,
                userName: `${user.firstName} ${user.lastName}`
            }
        });
        return await this.companyRepository.save(company);
    }

    async findAll(
        page: number | "all" = 1,
        limit: number = 10,
        sortByAsc?: string,
        sortByDes?: string
    ): Promise<{ data: Company[], totalCount: number }> {

        let queryBuilder = this.companyRepository.createQueryBuilder('company')
            .addSelect(`SUBSTRING_INDEX(company.location, ',', 1)`, 'latitude')
            .addSelect(`SUBSTRING_INDEX(SUBSTRING_INDEX(company.location, ',', 2), ',', -1)`, 'longitude')
            .where('company.deleted = :deleted', { deleted: false });

        if (page !== "all") {
            const skip = (page - 1) * limit;
            queryBuilder = queryBuilder.skip(skip).take(limit);
        }

        const sortMap = {
            companyName: 'company.companyName',
            email: 'company.email',
            phoneNo: 'company.phoneNo',
            createdOn: 'company.createdOn',
            latitude: 'latitude',
            longitude: 'longitude'
        };

        if (sortByAsc) {
            const sortField = sortMap[sortByAsc] || `company.${sortByAsc}`;
            queryBuilder = queryBuilder.addOrderBy(sortField, 'ASC');
        }

        if (sortByDes) {
            const sortField = sortMap[sortByDes] || `company.${sortByDes}`;
            queryBuilder = queryBuilder.addOrderBy(sortField, 'DESC');
        }

        const [data, totalCount] = await Promise.all([
            queryBuilder.getMany(),
            queryBuilder.getCount()
        ]);

        return { data, totalCount };
    }

    async findOne(id: number): Promise<Company> {
        const company = await this.companyRepository.findOne({ where: { id, deleted: false } });
        if (!company) {
            throw new NotFoundException('company not found');
        }
        return company;
    }

    async update(id: number, companyData: CreateCompanyDto, userId): Promise<Company> {
        try {
            const company = await this.companyRepository.findOne({ where: { id, deleted: false } });
            if (!company) {
                throw new NotFoundException(`company with ID ${id} not found`);
            }
            company.updatedBy = userId
            Object.assign(company, companyData);
            return await this.companyRepository.save(company);
        } catch (error) {
            throw new Error(`Unable to update company : ${error.message}`);
        }
    }

    async remove(id: number): Promise<any> {
        const existingCompany = await this.companyRepository.findOne({ where: { id, deleted: false } });
        if (!existingCompany) {
            throw new NotFoundException('company not found');
        }
        existingCompany.deleted = true
        await this.companyRepository.save(existingCompany);
        return { message: `Successfully deleted id ${id}` }
    }
}
