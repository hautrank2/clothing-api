import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Model } from 'mongoose';
import { Product } from 'src/schemas/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { forkJoin, from, map, Observable } from 'rxjs';
import { PaginationResponse } from 'src/types/response';
import { prettyObject } from 'src/types/common';

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
    categoryId?: string,
  ): Observable<PaginationResponse<Product>> {
    const skip = (page - 1) * pageSize;
    const filter = prettyObject({ categoryId });
    return forkJoin({
      total: from(this.productModel.countDocuments(filter)),
      items: from(
        this.productModel.find(filter).skip(skip).limit(pageSize).exec(),
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

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  findByCode(code: string): Observable<Product[] | []> {
    return from(this.productModel.find({ code }).exec());
  }

  codeIsExist(code: string): Observable<boolean> {
    return from(this.productModel.find({ code }).exec()).pipe(
      map(e => e && e.length > 0),
    );
  }

  isValidNewCode(code: string, id: string): Observable<boolean> {
    return from(
      this.productModel.findOne({ code, _id: { $ne: id } }).exec(),
    ).pipe(map(e => !!e));
  }
}
