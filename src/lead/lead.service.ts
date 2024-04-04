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

  async findAllLeads(): Promise<Lead[]> {
    return await this.leadRepository.find();
  }

  async findLeadById(id: number): Promise<Lead> {
    return await this.leadRepository.findOne({where:{id}});
  }

 
  async update(id: number, leadData: CreateLeadDto): Promise<Lead> {
    try {
      const lead = await this.leadRepository.findOne({ where: { id } });
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
