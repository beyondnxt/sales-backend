import { Controller, Get, Post, Body, Param, Put, Delete, Query, HttpException, HttpStatus, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  async create(@Body() productData: CreateProductDto, @Req() req: Request): Promise<Product> {
    try {
      const userId = req.headers['userid']
      return await this.productService.create(productData, userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Query('page') page: number | "all" = 1, @Query('limit') limit: number = 10,
    @Query('code') code: string, @Query('name') name: string, @Query('model') model: string):
    Promise<{ data: Product[], total: number, fetchedCount: number }> {
    try {
      return await this.productService.findAll(page, limit, code, name, model);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Product | undefined> {
    try {
      return await this.productService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() productData: CreateProductDto) {
    try {
      return this.productService.update(id, productData);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    try {
      return this.productService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
