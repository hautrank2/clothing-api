import { Product } from './product.schema';

export interface Item {
  product: string | Product;
  size: string;
  color: string;
  quantity: number;
}
