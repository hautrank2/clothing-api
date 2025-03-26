import mongoose from 'mongoose';

export interface Item {
  productId: mongoose.Types.ObjectId;
  size: string;
  color?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  name?: string;
}
