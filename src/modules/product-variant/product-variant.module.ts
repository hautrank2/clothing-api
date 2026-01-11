import { Module } from '@nestjs/common';
import { ProductVariantService } from './product-variant.service';
import { ProductVariantController } from './product-variant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductVariant,
  ProductVariantSchema,
} from 'src/schemas/product-variant.schema';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { UploadService } from 'src/services/upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ProductVariantController],
  providers: [ProductVariantService, UploadService],
  exports: [
    ProductVariantService,
    MongooseModule.forFeature([
      { name: ProductVariant.name, schema: ProductVariantSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
})
export class ProductVariantModule {}
