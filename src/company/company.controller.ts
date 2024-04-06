import { Body, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/company.dto';

@Controller('company')
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService
    ) { }

    @Post()
    async create(@Body() companyDate: CreateCompanyDto, @Req() req: Request) {
        try {
            const userId = req.headers['userid']
            return await this.companyService.create(companyDate, userId)
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
