import { Controller, Get, Body, Param, Put, Delete, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }


  @Get('getProductData')
  async getProductData(): Promise<any> {
    try {
      return await this.productService.getProductData();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
  // @Post()
  // async create(@Body() productData: CreateProductDto): Promise<Product> {
  //   try {
  //     return await this.productService.create(productData);
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  @Get()
  async findAll(@Query('page') page: number | "all" = 1, @Query('limit') limit: number = 10,
    @Query('code') code: string, @Query('name') name: string, @Query('model') model: string,
    @Query('size') size: string, @Query('rackNo') rackNo: string, @Query('brandName') brandName: string):
    Promise<{ data: Product[], total: number, fetchedCount: number }> {
    try {
      return await this.productService.findAll(page, limit, code, name, model, size, rackNo, brandName);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Product | undefined> {
    try {
      return await this.productService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() productData: CreateProductDto) {
    try {
      return this.productService.update(id, productData);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      return this.productService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
