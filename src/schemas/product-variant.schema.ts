import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Product } from './product.schema';

/* =======================
   ENUMS
======================= */

export enum ProductColorEnum {
  BLACK = 'black',
  WHITE = 'white',
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange',
  BROWN = 'brown',
  GRAY = 'gray',
}

export enum ProductSizeEnum {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
}

/* =======================
   PRODUCT VARIANT
======================= */

@Schema({ timestamps: true })
export class ProductVariant extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: true,
    index: true,
  })
  productId: mongoose.Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(ProductColorEnum),
  })
  color: ProductColorEnum;

  @Prop({
    required: true,
    enum: Object.values(ProductSizeEnum),
  })
  size: ProductSizeEnum | number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ type: [String], default: [] })
  imgUrls: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);

// productId color and size must be unique
ProductVariantSchema.index(
  { productId: 1, color: 1, size: 1 },
  { unique: true },
);
