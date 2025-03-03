import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from 'src/schemas/category.schema';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';

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
    return from(this.categoryModel.findById(id));
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const updated = this.categoryModel.findByIdAndUpdate(id, updateCategoryDto);
    return `This action updates a #${id} category`;
  }

  remove(id: string) {
    return from(this.categoryModel.findByIdAndDelete(id));
  }
}
