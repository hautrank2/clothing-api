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
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/services/upload.service';
import { catchError, map, mergeMap, of, switchMap, throwError } from 'rxjs';

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

    return this.categoryService.findByCode(createCategoryDto.code).pipe(
      mergeMap(category =>
        category
          ? throwError(() => new BadRequestException('Code already exists'))
          : this.uploadService.uploadFile(file, ['clothes', 'category']),
      ),
      switchMap(imgUrl => {
        const createData = { ...createCategoryDto, imgUrl };
        return this.categoryService.create(createData).pipe(
          catchError(err => {
            return this.uploadService
              .removeFile(imgUrl)
              .pipe(
                switchMap(() => throwError(() => new BadRequestException(err))),
              );
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
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const upload$ = this.uploadService.uploadFile(file, [
      'clothes',
      'category',
    ]);
    return this.categoryService.findOne(id).pipe(
      switchMap(data => {
        if (!data) {
          throwError(() => new NotFoundException('Category not found'));
        }
        return file
          ? upload$.pipe(map(imgUrl => ({ ...dto, imgUrl })))
          : of(dto);
      }),
      mergeMap(data => {
        return this.categoryService.update(id, data);
      }),
      catchError(err =>
        throwError(() => new InternalServerErrorException(err)),
      ),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
