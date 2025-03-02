import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true }) // Tự động thêm createdAt & updatedAt
export class Category extends Document {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  imgUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  parentId?: string | null;
}

// Tạo Mongoose Schema từ class
export const CategorySchema = SchemaFactory.createForClass(Category);
