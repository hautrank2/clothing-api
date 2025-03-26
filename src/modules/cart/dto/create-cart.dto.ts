import { Item } from 'src/schemas/item.schema';

export class CreateCartDto {
  user: string;
  items: Item[];
}
