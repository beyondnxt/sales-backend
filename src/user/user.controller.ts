import { Controller, Get, Param, NotFoundException, Delete, Put, Body, HttpException, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/all')
  async getUsers(): Promise<{ data: User[] }> {
    try {
      return await this.userService.getUsers();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getUsersWithRole(@Query('page') page: number | "all" = 1, @Query('limit') limit: number, @Query('firstName') firstName: string,
    @Query('lastName') lastName: string): Promise<{ data: any[], total: number }> {
    try {
      return await this.userService.getUsersWithRoles(page, limit, firstName, lastName)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getUserById(@Param('id') userId: number) {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() user: User): Promise<User> {
    try {
      const updatedUser = await this.userService.updateUser(id, user);
      return updatedUser;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<any> {
    try {
      return await this.userService.deleteUser(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
