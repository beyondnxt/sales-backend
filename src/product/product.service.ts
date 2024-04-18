import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(productData: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(productData)
    return await this.productRepository.save(product);
  }

  async findAll(page: number | "all" = 1, limit: number = 10, code: string, name: string,
    model: string, size: string, rackNo: string, brandName: string): Promise<{ data: Product[], total: number, fetchedCount: number }> {

    const where: any = {};

    if (code) {
      where.code = Like(`%${code}%`);
    }
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (model) {
      where.model = Like(`%${model}%`);
    }
    if (size) {
      where.size = Like(`%${size}%`);
    }
    if (rackNo) {
      where.rackNo = Like(`%${rackNo}%`);
    }
    if (brandName) {
      where.brandName = Like(`%${brandName}%`);
    }

    let queryBuilder = this.productRepository.createQueryBuilder('product') // Use 'product' as the alias
      .andWhere(where);

    if (page !== "all") {
      const skip = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(skip).take(limit);
    }

    const products = await queryBuilder.getMany();
    const totalCount = await this.productRepository.count();

    return {
      data: products,
      fetchedCount: products.length,
      total: totalCount
    };
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepository.findOne({ where: { id } });
  }

  async update(id: number, productData: CreateProductDto): Promise<Product> {
    try {
      const products = await this.productRepository.findOne({ where: { id } });
      if (!products) {
        throw new NotFoundException(`products  with ID ${id} not found`);
      }
      this.productRepository.merge(products, productData);
      return await this.productRepository.save(products);
    } catch (error) {
      throw new Error(`Unable to update products  : ${error.message}`);
    }
  }

  async remove(id: number): Promise<any> {
    const products = await this.productRepository.findOne({ where: { id } });
    if (!products) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.remove(products);
    return { message: `Successfully deleted id ${id}` }
  }
}
