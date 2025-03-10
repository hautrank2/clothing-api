import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from 'src/schemas/category.schema';
import mongoose, { Model } from 'mongoose';
import { from, map, mergeMap, Observable } from 'rxjs';
import { PaginationResponse } from 'src/types/response';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const created = new this.categoryModel(createCategoryDto);
    return from(created.save());
  }

  findAll(
    page: number,
    pageSize: number,
  ): Observable<PaginationResponse<Category>> {
    const skip = (page - 1) * pageSize;
    return from(this.categoryModel.countDocuments()).pipe(
      mergeMap(total => {
        return from(
          this.categoryModel
            .find()
            .skip(skip)
            .limit(pageSize)
            .populate('parentId')
            .lean()
            .exec(),
        ).pipe(
          map((items: Category[]) => ({
            items: items.map(item => {
              const parentId = item.parentId as
                | Category
                | mongoose.Types.ObjectId
                | null;
              return {
                ...item,
                parent: item.parentId || null,
                parentId:
                  typeof parentId === 'object' && parentId !== null
                    ? parentId._id
                    : parentId,
              };
            }) as Category[],
            page,
            pageSize,
            total,
            totalPage: total / page,
          })),
        );
      }),
    );
  }

  findOne(id: string): Observable<Category | null> {
    return from(this.categoryModel.findById(id).exec());
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return from(this.categoryModel.findByIdAndUpdate(id, updateCategoryDto));
  }

  remove(id: string) {
    return from(this.categoryModel.findByIdAndDelete(id));
  }

  findByCode(code: string): Observable<Category[] | []> {
    return from(this.categoryModel.find({ code }).exec());
  }

  codeIsExist(code: string): Observable<boolean> {
    return from(this.categoryModel.find({ code }).exec()).pipe(
      map(e => e && e.length > 0),
    );
  }

  isValidNewCode(code: string, id: string): Observable<boolean> {
    return from(
      this.categoryModel.findOne({ code, _id: { $ne: id } }).exec(),
    ).pipe(map(e => !!e));
  }
}
