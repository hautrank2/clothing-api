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

export type ProductSizeType = ProductSizeEnum | number;
/* =======================
   PRODUCT VARIANT
======================= */
export class ProductSizeVariant {
  @Prop({
    type: mongoose.Schema.Types.Mixed,
    required: true,
    index: true,
  })
  size: ProductSizeType;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ required: true })
  sku: string;

  @Prop({ default: true })
  isActive: boolean;
}

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
    type: [ProductSizeVariant],
    required: true,
    default: [],
  })
  sizes: ProductSizeVariant[];

  @Prop({ type: [String], default: [] })
  imgUrls: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);

// productId color and size must be unique
ProductVariantSchema.index({ productId: 1, color: 1 }, { unique: true });
