import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/product.dto';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    async create(@Body() createProductDto: CreateProductDto, @Req() req: Request): Promise<Product> {
      try {
        const userId = req.headers['userid'];
        return this.productService.create(createProductDto, userId);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    @Get()
    async findAll(@Query('page') page: number, @Query('limit') limit: number): Promise<{ data: Product[]; total: number }> {
      try {
        return this.productService.findAll(page, limit);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Get(':id')
    async findById(@Param('id') id: number): Promise<Product> {
      try {
        return this.productService.findById(id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Put(':id')
    async update(@Param('id') id: number, @Body() updateProductDto: CreateProductDto,@Req() req: Request): Promise<Product> {
      try {
        const userId = req.headers['userid'];
        return this.productService.update(id, updateProductDto, userId);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    @Delete(':id')
    async delete(@Param('id') id: number): Promise<void> {
      try {
        return this.productService.delete(id);
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
}
