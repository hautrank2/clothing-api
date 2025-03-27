import mongoose, { HydratedDocument, Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Item } from './item.schema';

export type CategoryDocument = HydratedDocument<Cart>;

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop([
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      size: { type: String, required: true },
      color: { type: String, required: true },
      quantity: { type: Number, default: 1 },
    },
  ])
  items: Item[];

  @Prop({ default: false })
  isCheckedOut: boolean;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
