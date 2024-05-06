import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Role } from './entity/role.entity';
import { CreateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const role = this.roleRepository.create(createRoleDto);
      return await this.roleRepository.save(role);
    } catch (error) {
      throw new Error(`Unable to create role : ${error.message}`);
    }
  }

  async getAllRoles(page: number | "all" = 1, limit: number = 10, name: string): Promise<{ data: Role[], fetchedCount: number, totalCount: number }> {
    const where: any = {};
    if (name) {
      where.name = Like(`%${name}%`);
    }
    let queryBuilder = this.roleRepository.createQueryBuilder('role')
      .andWhere(where);

    if (page !== "all") {
      const skip = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(skip).take(limit);
    }

    const [role, totalCount] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount()
    ]);
    return {
      data: role,
      fetchedCount: role.length,
      totalCount: totalCount
    };
  }


  async getRoleById(id: number): Promise<Role> {
    try {
      return await this.roleRepository.findOne({ where: { id } });
    } catch (error) {
      throw new Error(`Unable to fetch role: ${error.message}`);
    }
  }

  async updateRole(id: number, updateRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      this.roleRepository.merge(role, updateRoleDto);
      return await this.roleRepository.save(role);
    } catch (error) {
      throw new Error(`Unable to update role : ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      await this.roleRepository.remove(role);
    } catch (error) {
      throw new Error(`Unable to delete role: ${error.message}`);
    }
  }

}
