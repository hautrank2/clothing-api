import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { forkJoin, from, map, Observable } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from 'src/schemas/order.schema';
import { Model } from 'mongoose';
import { PaginationResponse } from 'src/types/response';
import { prettyObject } from 'src/types/common';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  create(createOrderDto: CreateOrderDto): Observable<Order> {
    const created = new this.orderModel(createOrderDto);
    return from(created.save());
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  findByFilter(
    page: number = 1,
    pageSize: number = 10,
    options?: Record<string, any>,
  ): Observable<PaginationResponse<Order>> {
    page = !page ? 1 : page;
    pageSize = !pageSize ? 10 : pageSize;
    const skip = (page - 1) * pageSize;
    const filter = options ? prettyObject(options) : {};
    return forkJoin({
      total: from(this.orderModel.countDocuments(filter)),
      items: from(
        this.orderModel
          .find(filter)
          .populate('user')
          .skip(skip)
          .limit(pageSize)
          .lean()
          .exec(),
      ),
    }).pipe(
      map(({ total, items }) => ({
        items,
        page,
        pageSize,
        total,
        totalPage: Math.ceil(total / pageSize),
      })),
    );
  }

  findByUserId(userId: string) {
    return from(
      this.orderModel
        .find({ user: userId })
        .populate('items.product')
        .lean()
        .exec(),
    );
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return from(this.orderModel.findByIdAndUpdate(id, updateOrderDto).lean());
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
