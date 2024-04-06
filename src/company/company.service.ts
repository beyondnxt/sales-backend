import { Injectable } from '@nestjs/common';
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

    async create(companyData: CreateCompanyDto, userId: number): Promise<Company>{
        const company = this.companyRepository.create(companyData)
        company.createdBy = userId
        return await this.companyRepository.save(company)
    }
}
