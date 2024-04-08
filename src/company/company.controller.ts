import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put, Query, Req } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/company.dto';
import { Company } from './entity/company.entity';

@Controller('company')
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService
    ) { }

    @Post()
    async create(@Body() companyData: CreateCompanyDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid']
            return await this.companyService.create(companyData, userId)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ company: Company[], totalCount: number }> {
        try {
            return await this.companyService.findAll(page, limit);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Company> {
        try {
            const Company = await this.companyService.findOne(id);
            if (!Company) {
                throw new NotFoundException('Company not found');
            }
            return Company;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() companyData: CreateCompanyDto, @Req() req: Request): Promise<Company> {
        try {
            const userId = req.headers['userid']
            return await this.companyService.update(id, companyData, userId);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<any> {
        try {
            return await this.companyService.remove(id);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
