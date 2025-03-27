import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from 'src/schemas/cart.schema';
import { from, mergeMap, Observable } from 'rxjs';
import { Item } from 'src/schemas/item.schema';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) {}

  create(createCartDto: CreateCartDto) {
    const cart = new this.cartModel(createCartDto);
    return from(cart.save());
  }

  findByUserId(userId: string) {
    return from(
      this.cartModel
        .findOne({ user: userId.toString() })
        .populate('items.product'),
    );
  }

  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: string, updateCartDto: Cart): Observable<Cart | null> {
    return from(
      this.cartModel
        .findByIdAndUpdate(id, updateCartDto, { new: true })
        .lean()
        .exec(),
    );
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }

  addItem(item: Item, userId: string): Observable<Cart | null> {
    return from(
      this.findByUserId(userId).pipe(
        mergeMap((cart: Cart | null) => {
          if (!cart) {
            return this.create({ user: userId, items: [item] });
          }
          const currItem = this.findItem(item, cart);
          if (currItem) {
            currItem.item.quantity = currItem.item.quantity + item.quantity;
            cart[currItem.index] = currItem.item;
          } else {
            cart.items.push(item);
          }
          return this.update(String(cart._id), cart);
        }),
      ),
    );
  }

  findItem(item: Item, cart: Cart): { item: Item; index: number } | null {
    const index = cart.items.findIndex(
      it => it.color === item.color && it.product === item.product,
    );
    // compared item
    return index !== -1 ? { item: cart.items[index], index } : null;
  }
}
