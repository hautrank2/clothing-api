import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/services/upload/upload.service';
import { catchError, mergeMap, throwError } from 'rxjs';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image required');
    }
    console.log(createCategoryDto);
    return this.uploadService.uploadFile(file, ['clothes', 'category']).pipe(
      mergeMap(imgUrl => {
        const createData = { ...createCategoryDto, imgUrl };
        return this.categoryService.create(createData).pipe(
          catchError(() => {
            return this.uploadService
              .removeFile(imgUrl)
              .pipe(mergeMap(() => throwError('Create category faild')));
          }),
        );
      }),
    );
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
