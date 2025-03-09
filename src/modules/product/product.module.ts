import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { UploadService } from 'src/services/upload.service';
import { CategoryService } from '../category/category.service';
import { Category, CategorySchema } from 'src/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, UploadService, CategoryService],
})
export class ProductModule {}
