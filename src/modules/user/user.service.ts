import { Injectable } from '@nestjs/common';
import { CreateUserDto, UserWithEmailDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { forkJoin, from, map, Observable } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { FilterQuery, Model } from 'mongoose';
import { PaginationResponse } from 'src/types/response';
import { prettyObject } from 'src/types/common';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  create(createUserDto: CreateUserDto) {
    const created = new this.userModel(createUserDto);
    return from(created.save());
  }

  createWithEmail(dto: UserWithEmailDto) {
    const created = new this.userModel({
      name: dto.email,
      username: dto.email,
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
        this.userModel.find(filter).skip(skip).limit(pageSize).lean().exec(),
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

  findOneByQuery(filter: FilterQuery<User>) {
    return from(this.userModel.findOne(filter).lean().exec());
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return from(this.userModel.deleteOne({ _id: id }).exec());
  }
}
