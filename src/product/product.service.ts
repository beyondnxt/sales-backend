import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/product.dto';
import { ConnectionPool } from 'mssql';
import { createWriteStream, unlink } from 'fs';

@Injectable()
export class ProductService {
  private pool: ConnectionPool;
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    this.pool = new ConnectionPool({
      type: 'mssql',
      user: process.env.SSMS_USERNAME,
      password: process.env.SSMS_PASSWORD,
      server: process.env.SSMS_HOST,
      port: parseInt(process.env.SSMS_PORT),
      database: process.env.SSMS_DATABASE,
      synchronize: true,
      options: {
        encrypt: false
      }
    });
  }

  async executeQuery(query: string): Promise<any> {
    const pool = await this.pool.connect();
    const result = await pool.query(query);
    await pool.close();
    return result.recordset;
  }

  async getProductData(): Promise<void> {
    const query = `SELECT * FROM [012425].[dbo].[DBR1_V1]`;
    const products = await this.executeQuery(query);
    const csvData = this.convertToCsv(products);
    const filePath = 'products.csv';
    createWriteStream(filePath).write(csvData);
    await this.uploadCsvToSqlDb(filePath);
    unlink(filePath, (err) => {
      if (err) throw err;
    });
  }

  private async uploadCsvToSqlDb(filePath: string): Promise<void> {
    try {
      const sqlPool = new ConnectionPool({
        type: 'mysql',
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
      });
      console.log('sqlPool', sqlPool)
      await sqlPool.connect();
      await sqlPool.query(`BULK INSERT product FROM '${filePath}' WITH (FORMAT = 'CSV', FIELDTERMINATOR = ',', ROWTERMINATOR = '\\n', FIRSTROW = 2)`);
      await sqlPool.close();
    } catch (error) {
      throw new Error(`Failed to upload CSV file to sql database: ${error.message}`);
    }
  }

  private convertToCsv(data: any[]): string {
    const header = Object.keys(data[0]).join(',') + '\n';
    const rows = data.map(obj => Object.values(obj).map((value: any) => JSON.stringify(value)).join(',')).join('\n');
    return header + rows;
  }

  // async create(productData: CreateProductDto): Promise<Product> {
  //   const product = this.productRepository.create(productData)
  //   return await this.productRepository.save(product);
  // }

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
