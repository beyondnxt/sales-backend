import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entity/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
      ) {}
    
      async create(createProductDto: CreateProductDto, userId: number): Promise<Product> {
        const lastProduct = await this.productRepository.findOne({ order: { code: 'DESC' }, where: {}  });
        const lastCode = lastProduct ? parseInt(lastProduct.code.replace('P', '')) : 0;
        const newCode = `P${(lastCode + 1).toString().padStart(3, '0')}`;
        const product = this.productRepository.create({
          ...createProductDto,
          code: newCode,
          createdBy: userId
        });
        return await this.productRepository.save(product);
      }
      
      async findAll(page: number = 1, limit: number = 10): Promise<{ data: Product[]; total: number }> {
        const [products, total] = await this.productRepository.findAndCount({
          take: limit,
          skip: (page - 1) * limit,
        });
        return { data: products, total };
      }
    
      async findById(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({where:{id}});
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        return product;
      }
    
      async update(id: number, updateProductDto: CreateProductDto, userId: number): Promise<Product> {
        const product = await this.findById(id);
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        product.updatedBy= userId;
        Object.assign(product, updateProductDto);
        return await this.productRepository.save(product);
      }
    
      async delete(id: number): Promise<any> {
        const product = await this.findById(id);
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        await this.productRepository.remove(product);
        return {message: `successfully deleted id ${id}`}
      }
}
