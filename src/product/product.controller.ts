import {  Controller, } from '@nestjs/common';
import { ProductService } from './product.service';
// import { Product } from './entity/product.entity';
// import { CreateProductDto } from './dto/product.dto';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

}
