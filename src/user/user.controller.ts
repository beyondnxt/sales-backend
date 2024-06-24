import { Controller, Get, Param, Delete, Put, Body, HttpException, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/user.dto';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/all')
  async getUsers(): Promise<{ data: User[] }> {
    try {
      return await this.userService.getUsers();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get()
  async getUsersWithRole(@Query('page') page: number | "all" = 1, @Query('limit') limit: number, @Query('firstName') firstName: string,
    @Query('lastName') lastName: string): Promise<{ data: any[], total: number }> {
    try {
      return await this.userService.getUsersWithRoles(page, limit, firstName, lastName)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    try {
      return await this.userService.getUserById(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() updateUserDto: CreateUserDto): Promise<User> {
    try {
      const updatedUser = await this.userService.updateUser(id, updateUserDto);
      return updatedUser;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<any> {
    try {
      return await this.userService.deleteUser(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

}
