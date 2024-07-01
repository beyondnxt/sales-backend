import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, HttpException, HttpStatus, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { Role } from './entity/role.entity';
import { CreateRoleDto } from './dto/role.dto';


@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Get()
  async getAllRoles(@Query('page') page: number | "all" = 1, @Query('limit') limit: number = 10, @Query('name') name: string,
    @Query('sortByAsc') sortByAsc?: string, @Query('sortByDes') sortByDes?: string): Promise<{ data: Role[], fetchedCount: number, totalCount: number }> {
    try {
      return await this.roleService.getAllRoles(page, limit, name, sortByAsc, sortByDes);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id')
  async getRoleById(@Param('id') id: number): Promise<Role> {
    try {
      const role = await this.roleService.getRoleById(id);
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      return role;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      return await this.roleService.createRole(createRoleDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  async updateRole(@Param('id') id: number, @Body() updateRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const updatedRole = await this.roleService.updateRole(id, updateRoleDto);
      if (!updatedRole) {
        throw new NotFoundException('Role not found');
      }
      return updatedRole;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<any> {
    try {
      return await this.roleService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
