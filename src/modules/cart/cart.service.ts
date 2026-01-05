import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from 'src/schemas/cart.schema';
import {
  ProductSizeType,
  ProductVariant,
} from 'src/schemas/product-variant.schema';
import { from, mergeMap, map, Observable, of, throwError } from 'rxjs';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(ProductVariant.name)
    private variantModel: Model<ProductVariant>,
  ) {}

  /* =====================
     GET OR CREATE CART
  ====================== */
  getOrCreateCart(userId: string): Observable<Cart> {
    return from(this.cartModel.findOne({ userId }).exec()).pipe(
      mergeMap(cart =>
        cart ? of(cart) : from(this.cartModel.create({ userId, items: [] })),
      ),
    );
  }

  /* =====================
     VIEW CART (ACTIVE ITEMS)
  ====================== */
  getMyCart(userId: string) {
    return from(
      this.cartModel
        .findOne({ userId })
        .populate({
          path: 'items.variantId',
          match: { isActive: true },
        })
        .lean()
        .exec(),
    ).pipe(
      map(cart => {
        if (!cart) return null;
        return {
          ...cart,
          items: cart.items.filter(i => !i.isCheckedOut),
        };
      }),
    );
  }

  /* =====================
     ADD ITEM
  ====================== */
  addItem(
    userId: string,
    variantId: string,
    size: ProductSizeType,
    quantity: number,
  ): Observable<Cart> {
    return this.getOrCreateCart(userId).pipe(
      mergeMap(cart =>
        from(this.variantModel.findById(variantId).exec()).pipe(
          mergeMap(variant => {
            if (!variant || !variant.isActive) {
              return throwError(
                () => new BadRequestException('Variant not found'),
              );
            }

            const sizeVariant = variant.sizes.find(s => s.size === size);

            if (!sizeVariant || !sizeVariant.isActive) {
              return throwError(
                () => new BadRequestException('Size not available'),
              );
            }

            if (sizeVariant.stock < quantity) {
              return throwError(
                () =>
                  new BadRequestException('Requested quantity exceeds stock'),
              );
            }

            const existing = cart.items.find(
              i =>
                i.variantId.toString() === variantId &&
                i.size === size &&
                !i.isCheckedOut,
            );

            if (existing) {
              existing.quantity = Math.min(
                existing.quantity + quantity,
                sizeVariant.stock,
              );
            } else {
              cart.items.push({
                variantId: new Types.ObjectId(variantId),
                size,
                quantity,
                createdAt: new Date(),
                isCheckedOut: false,
              });
            }

            return from(cart.save());
          }),
        ),
      ),
    );
  }

  /* =====================
     UPDATE ITEM QUANTITY
  ====================== */
  updateItem(
    userId: string,
    itemId: string,
    quantity: number,
  ): Observable<Cart> {
    return this.getOrCreateCart(userId).pipe(
      mergeMap(cart => {
        const item = cart.items.id(itemId);
        if (!item || item.isCheckedOut) {
          return throwError(
            () => new BadRequestException('Cart item not found'),
          );
        }

        return from(this.variantModel.findById(item.variantId).exec()).pipe(
          mergeMap(variant => {
            if (!variant)
              return throwError(
                () => new BadRequestException('Variant not found'),
              );

            const sizeVariant = variant.sizes.find(s => s.size === item.size);

            if (!sizeVariant)
              return throwError(
                () => new BadRequestException('Size not found'),
              );

            if (quantity > sizeVariant.stock)
              return throwError(
                () =>
                  new BadRequestException('Requested quantity exceeds stock'),
              );

            item.quantity = quantity;
            return from(cart.save());
          }),
        );
      }),
    );
  }

  /* =====================
     REMOVE ITEM
  ====================== */
  removeItem(userId: string, itemId: string): Observable<Cart> {
    return this.getOrCreateCart(userId).pipe(
      mergeMap(cart => {
        const item = cart.items.id(itemId);
        if (!item)
          return throwError(
            () => new BadRequestException('Cart item not found'),
          );
        item.deleteOne();
        return from(cart.save());
      }),
    );
  }
}
