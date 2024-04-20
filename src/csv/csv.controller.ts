import { Controller, Get, HttpStatus } from '@nestjs/common';
import { SqlService } from './csv.service';

@Controller('csv')
export class sqlController {
  constructor(private readonly sqlService: SqlService) {}

  @Get()
  async getUsers(): Promise<any> {
    try {
      const users = await this.sqlService.getUsers();
      return {
        status: HttpStatus.OK,
        data: users,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `Failed to fetch users: ${error.message}`,
      };
    }
  }
}
