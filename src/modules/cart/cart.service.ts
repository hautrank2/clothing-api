import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from 'src/schemas/cart.schema';
import { from, mergeMap } from 'rxjs';
import { Item } from 'src/schemas/item.schema';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

  create(createCartDto: CreateCartDto) {
    const cart = new this.cartModel(createCartDto);
    return from(cart.save());
  }

  findByUserId(userId: string) {
    return from(this.cartModel.findOne({ user: userId }).lean().exec());
  }

  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: string, updateCartDto: Cart) {
    return from(
      this.cartModel.findByIdAndUpdate(id, updateCartDto).lean().exec(),
    );
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }

  addItem(item: Item, userId: string) {
    return from(
      this.findByUserId(userId).pipe(
        mergeMap((cart: Cart | null) => {
          if (!cart) {
            return this.create({ user: userId, items: [item] });
          }
          const currItem = this.findItem(item, cart);
          if (currItem) {
            currItem.quantity = currItem.quantity + item.quantity;
          } else {
            cart.items.push(item);
          }
          return this.update(String(cart._id), cart);
        }),
      ),
    );
  }

  findItem(item: Item, cart: Cart): Item | null {
    // compared item
    return (
      cart.items.find(
        it => it.color === item.color && it.productId === item.productId,
      ) || null
    );
  }
}
