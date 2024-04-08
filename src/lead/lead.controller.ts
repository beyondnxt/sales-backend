import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, Req } from '@nestjs/common';
import { LeadService } from './lead.service';
import { Lead } from './entity/lead.entity';
import { CreateLeadDto } from './dto/lead.dto';

@Controller('lead')
export class LeadController {
    constructor(private readonly leadService: LeadService) { }

    @Post()
    async createLead(@Body() leadData: CreateLeadDto, @Req() req: Request): Promise<Lead> {
        try {
            const userId = req.headers['userid'];
            return await this.leadService.createLead(leadData, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAllLeads(page: number | "all" = 1, limit: number = 10): Promise<{ data: any[], total: number, fetchedCount: number }> {
        try {
            return await this.leadService.findAll(page, limit);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async findLeadById(@Param('id') id: number): Promise<Lead> {
        try {
            return await this.leadService.findLeadById(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() leadData: CreateLeadDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid']
            return this.leadService.update(id, leadData, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        try {
            return this.leadService.remove(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
