import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/product.dto';
import { ConnectionPool } from 'mssql';
import * as mysql from 'mysql';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProductService {
  private pool: ConnectionPool;
  private readonly mysqlConnection: mysql.Connection;
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
    this.mysqlConnection = mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
  }

  @Cron('0 30 9 * * *')
  async handleProductUpdate() {
    try {
      await this.getProductData();
    } catch (error) {
      console.error('Error occurred during Product update:', error);
    }
  }

  async executeQuery(query: string): Promise<any> {
    const pool = await this.pool.connect();
    const result = await pool.query(query);
    await pool.close();
    return result.recordset;
  }

  async getProductData(): Promise<any> {
    const query = `SELECT * FROM [012425].[dbo].[DBR1_V1]`;
    const data = await this.executeQuery(query);
    return await this.insertDataIntoMysql(data);
  }

  async insertDataIntoMysql(data: any[]): Promise<{ message: string }> {
    const columns = Object.keys(data[0]);
    const values = data.map(row => Object.values(row));
    const insertQuery = `INSERT INTO product (${columns.map(column => `\`${column}\``).join(', ')}) VALUES ? 
                        ON DUPLICATE KEY UPDATE ${columns.map(column => `\`${column}\` = VALUES(\`${column}\`)`).join(', ')}`;

    return new Promise((resolve, reject) => {
      this.mysqlConnection.connect();
      this.mysqlConnection.query(insertQuery, [values], (error) => {
        if (error) {
          console.error('Error occurred while inserting or updating data:', error);
          this.mysqlConnection.end();
          return reject(error);
        }
        this.mysqlConnection.end();
        resolve({message: 'Data inserted or updated successfully'});
      });
    });
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
