import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from 'src/schemas/category.schema';
import { Model, Types } from 'mongoose';
import { from, map, Observable } from 'rxjs';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const created = new this.categoryModel(createCategoryDto);
    return from(created.save());
  }

  findAll(): Observable<Category[]> {
    return from(this.categoryModel.find().exec());
  }

  findOne(id: string) {
    const objectId = new Types.ObjectId(id); // Chuyển đổi ID thành ObjectId
    return from(this.categoryModel.findById(objectId).exec());
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return from(this.categoryModel.findByIdAndUpdate(id, updateCategoryDto));
  }

  remove(id: string) {
    return from(this.categoryModel.findByIdAndDelete(id));
  }

  findByCode(code: string): Observable<Category | null> {
    return from(this.categoryModel.findOne({ code }).exec());
  }
}
