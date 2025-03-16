import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Product } from 'src/schemas/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { forkJoin, from, map, Observable } from 'rxjs';
import { PaginationResponse } from 'src/types/response';
import { prettyObject } from 'src/types/common';
import { Category } from 'src/schemas/category.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    const created = new this.productModel(createProductDto);
    return from(created.save());
  }

  findAll(
    page: number,
    pageSize: number,
    options?: Record<string, any>,
  ): Observable<PaginationResponse<Product>> {
    const skip = (page - 1) * pageSize;
    const filter = options ? prettyObject(options) : {};
    return forkJoin({
      total: from(this.productModel.countDocuments(filter)),
      items: from(
        this.productModel
          .find(filter)
          .skip(skip)
          .limit(pageSize)
          .populate('categoryId')
          .lean()
          .exec(),
      ),
    }).pipe(
      map(({ total, items }) => ({
        items: items.map(item => {
          const categoryId = item.categoryId as
            | Category
            | mongoose.Types.ObjectId
            | string;
          console.log(categoryId);
          return {
            ...item,
            category: item.categoryId || null,
            categoryId:
              typeof categoryId === 'object' && categoryId !== null
                ? categoryId?._id
                : categoryId,
          };
        }) as Product[],
        page,
        pageSize,
        total,
        totalPage: Math.ceil(total / pageSize),
      })),
    );
  }

  findOne(id: string): Observable<Product | null> {
    return from(this.productModel.findById(id).exec());
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return from(
      this.productModel.findByIdAndUpdate(id, updateProductDto, {
        new: true,
        runValidators: true,
      }),
    );
  }

  updateByQuery(id: string, query: FilterQuery<Product>) {
    return from(
      this.productModel.findByIdAndUpdate(id, query, {
        new: true,
        runValidators: true,
      }),
    );
  }

  remove(id: string): Observable<Product | null> {
    return from(this.productModel.findByIdAndDelete(id).exec());
  }

  findByCode(code: string): Observable<Product[] | []> {
    return from(this.productModel.find({ code }).exec());
  }

  codeIsExist(code: string): Observable<boolean> {
    return from(this.productModel.find({ code }).exec()).pipe(
      map(e => {
        return e && e.length > 0;
      }),
    );
  }

  isValidNewCode(code: string, id: string): Observable<boolean> {
    return from(
      this.productModel.findOne({ code, _id: { $ne: id } }).exec(),
    ).pipe(map(e => !!e));
  }
}
