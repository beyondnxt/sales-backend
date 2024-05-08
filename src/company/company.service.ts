import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepository: Repository<Company>
    ) { }

    async create(companyData: CreateCompanyDto, userId: number): Promise<Company> {
        const { latitude, longitude, ...rest } = companyData;
        const location = `${latitude},${longitude}`;
        
        const company = this.companyRepository.create({
            ...rest,
            location,
            createdBy: userId 
        });
        return await this.companyRepository.save(company);
    }
    
    async findAll(page: number = 1, limit: number = 10): Promise<{ data: Company[], totalCount: number }> {
        const [data, totalCount] = await this.companyRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, totalCount };
    }

    async findOne(id: number): Promise<Company> {
        const company = await this.companyRepository.findOne({ where: { id } });
        if (!company) {
            throw new NotFoundException('company not found');
        }
        return company;
    }

    async update(id: number, companyData: CreateCompanyDto, userId): Promise<Company> {
        try {
            const company = await this.companyRepository.findOne({ where: { id } });
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
        const existingCompany = await this.companyRepository.findOne({ where: { id } });
        if (!existingCompany) {
            throw new NotFoundException('company not found');
        }
        await this.companyRepository.remove(existingCompany);
        return { message: `Successfully deleted id ${id}` }
    }
}
