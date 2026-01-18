import { ProductVariant } from 'src/schemas/product-variant.schema';
import { Product } from 'src/schemas/product.schema';

export type ProductDto = Product & { variants?: ProductVariant[] };
