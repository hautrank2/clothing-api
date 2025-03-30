import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from 'src/schemas/cart.schema';
import { from, mergeMap, Observable, throwError } from 'rxjs';
import { Item } from 'src/schemas/item.schema';
import { ProductService } from '../product/product.service';
import { ProductColor } from 'src/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    private productService: ProductService,
  ) {}

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
          return this.productService.findOne(item.product as string).pipe(
            mergeMap(product => {
              if (!product)
                return throwError(
                  () => new BadRequestException('Product not found'),
                );
              // check quantity is still available
              // find product variant
              const pColor = product.colors.find(
                (i: ProductColor) => i.color === item.color,
              );
              if (!pColor)
                return throwError(
                  () =>
                    new BadRequestException(
                      `Product with color ${item.color} not found`,
                    ),
                );
              const pSize = pColor.sizes.find(size => size.size === item.size);
              if (!pSize || !pSize.stock)
                return throwError(
                  () =>
                    new BadRequestException(
                      `Product with size ${item.size} not found or the quantity is not available`,
                    ),
                );

              if (!cart) {
                // Ensure quantity not more quantity in the stock
                item.quantity = Math.min(pSize.stock, item.quantity);
                return this.create({ user: userId, items: [item] });
              }

              // Check if item added to cart previous
              const currItem = this.findItem(item, cart);
              if (currItem) {
                const newQuantity = currItem.item.quantity + item.quantity;
                currItem.item.quantity = Math.min(newQuantity, item.quantity);
                cart[currItem.index] = currItem.item;
              } else {
                item.quantity = Math.min(pSize.stock, item.quantity);
                cart.items.push(item);
              }
              return this.update(String(cart._id), cart);
            }),
          );
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
