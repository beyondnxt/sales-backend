import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lead } from './entity/lead.entity';
import { CreateLeadDto } from './dto/lead.dto';

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async createLead(leadData: CreateLeadDto, userId: number): Promise<Lead> {
    const lead = this.leadRepository.create(leadData);
    lead.createdBy= userId
    return await this.leadRepository.save(lead);
  }

  async findAll(page: number | "all" = 1, limit: number = 10): Promise<{ data: any[], total: number, fetchedCount: number }> {
    let queryBuilder = this.leadRepository.createQueryBuilder('product')

    if (page !== "all") {
        const skip = (page - 1) * limit;
        queryBuilder = queryBuilder.skip(skip).take(limit);
    }

    const lead = await queryBuilder.getMany();
    const totalCount = await this.leadRepository.count();

    return {
        data: lead,
        fetchedCount: lead.length,
        total: totalCount
    };
}

  async findLeadById(id: number): Promise<Lead> {
    const lead = await this.leadRepository.findOne({where:{id}})
    if (!lead) {
      throw new NotFoundException(`lead  with ID ${id} not found`);
    }
    return lead
  }

 
  async update(id: number, leadData: CreateLeadDto, userId): Promise<Lead> {
    try {
      const lead = await this.leadRepository.findOne({ where: { id } });
      lead.updatedBy = userId
      if (!lead) {
        throw new NotFoundException(`lead  with ID ${id} not found`);
      }
      this.leadRepository.merge(lead, leadData);
      return await this.leadRepository.save(lead);
    } catch (error) {
      throw new Error(`Unable to update lead  : ${error.message}`);
    }
  }

  async remove(id: number): Promise<any> {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    await this.leadRepository.remove(lead);
    return { message: `Successfully deleted id ${id}` }
  }
}
