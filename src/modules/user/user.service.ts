import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UserWithEmailDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  of,
  throwError,
} from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Address, User } from 'src/schemas/user.schema';
import { FilterQuery, Model } from 'mongoose';
import { PaginationResponse } from 'src/types/response';
import { prettyObject } from 'src/types/common';
import { Cart } from 'src/schemas/cart.schema';
import { Item } from 'src/schemas/item.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(User.name) private cartModel: Model<Cart>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const created = new this.userModel(createUserDto);
    return from(created.save());
  }

  createWithEmail(dto: UserWithEmailDto) {
    const created = new this.userModel({
      name: dto.email,
      username: dto.email.split('@').shift(),
      email: dto.email,
    });
    return from(created.save());
  }

  findAll() {
    return from(this.userModel.find().lean().exec());
  }

  findByFilter(
    page: number = 1,
    pageSize: number = 10,
    options?: Record<string, any>,
  ): Observable<PaginationResponse<User>> {
    page = !page ? 1 : page;
    pageSize = !pageSize ? 10 : pageSize;
    const skip = (page - 1) * pageSize;
    const filter = options ? prettyObject(options) : {};
    return forkJoin({
      total: from(this.userModel.countDocuments(filter)),
      items: from(
        this.userModel.find(filter).skip(skip).limit(pageSize).exec(),
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

  findOneByQuery(filter: FilterQuery<User>): Observable<User | null> {
    return from(this.userModel.findOne(filter).exec()).pipe(
      mergeMap(user => {
        if (!user) {
          return of(null);
        }
        return of(user);
      }),
      catchError(err => {
        return throwError(() => new NotFoundException(err));
      }),
    );
  }

  findOne(id: string) {
    return from(this.userModel.findById(id).lean().exec());
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return from(this.userModel.findByIdAndUpdate(id, updateUserDto));
  }

  remove(id: string): Observable<User> {
    return from(this.userModel.findByIdAndDelete(id).exec()).pipe(
      mergeMap(doc => {
        if (!doc) {
          return throwError(() => new NotFoundException('User not found'));
        }
        // trả về user vừa bị xoá
        return from([doc.toObject() as User]);
      }),
    );
  }

  addItem(item: Item, userId: string) {}

  updateAddress(id: string, dto: Address[]) {
    return from(
      this.userModel.findByIdAndUpdate(
        id,
        {
          $set: {
            address: dto,
          },
        },
        { new: true },
      ),
    );
  }
}
