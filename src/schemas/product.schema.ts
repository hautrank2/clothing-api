import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, SchemaTypes } from 'mongoose';
import { Category } from './category.schema';

export type Color =
  | 'black'
  | 'white'
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'brown'
  | 'gray';

export class ProductSizeStock {
  @Prop({ required: true, type: SchemaTypes.Mixed })
  size: string | number; // Có thể là chữ (S, M, L, XL) hoặc số (28, 29, 30)

  @Prop({ required: true, min: 0 })
  stock: number; // Số lượng tồn kho
}

export class ProductColor {
  @Prop({
    required: true,
    enum: [
      'black',
      'white',
      'red',
      'blue',
      'green',
      'yellow',
      'purple',
      'orange',
      'brown',
      'gray',
    ],
  })
  color: Color;

  @Prop({ required: true })
  hexCode: string; // Mã màu HEX

  @Prop({ type: [String], validate: (val: string[]) => val.length === 2 })
  imgUrls: string[]; // Mỗi màu có 2 ảnh

  @Prop({ type: [{ size: String, stock: Number }], required: true })
  sizes: ProductSizeStock[];
}

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: number;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  })
  categoryId: string;

  @Prop()
  description: string;

  @Prop({
    type: [
      {
        color: String,
        hexCode: String,
        imgUrls: [String],
        sizes: [{ size: String, stock: Number }],
      },
    ],
  })
  colors: ProductColor[];

  category: Category | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
