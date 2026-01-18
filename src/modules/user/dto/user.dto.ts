import { Cart } from 'src/schemas/cart.schema';
import { User } from 'src/schemas/user.schema';

export type UserDto = User & { cart?: Cart | null };
