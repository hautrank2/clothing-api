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
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/services/upload.service';
import {
  catchError,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCategoryDto,
  ) {
    console.log('file', file);
    if (!file) {
      throw new BadRequestException('Image required');
    }
    return this.categoryService.codeIsExist(dto.code).pipe(
      mergeMap(codeIsExist =>
        codeIsExist
          ? throwError(() => new BadRequestException('Code already exists'))
          : this.uploadService.uploadFile(
              file,
              ['clothes', 'category'],
              dto.code,
            ),
      ),
      switchMap(imgUrl => {
        const createData = { ...dto, imgUrl };
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
  findAll(@Query('page') page: string, @Query('pageSize') pageSize: string) {
    return this.categoryService.findAll(+page, +pageSize);
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.categoryService.findByCode(code).pipe(map(e => e[0]));
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoryService.findOne(id).pipe(
      switchMap(data => {
        if (!data) {
          return throwError(() => new NotFoundException('Category not found'));
        }
        return this.categoryService.isValidNewCode(dto.code, id).pipe(
          switchMap(existCate => {
            if (existCate) {
              return throwError(
                () => new BadRequestException(`Code ${dto.code} exists`),
              );
            }
            return file
              ? this.uploadService
                  .uploadFile(file, ['clothes', 'category'], dto.code)
                  .pipe(
                    tap(
                      () =>
                        data?.imgUrl &&
                        this.uploadService.removeFile(data?.imgUrl),
                    ),
                    map(imgUrl => ({ ...dto, imgUrl })),
                  )
              : of(dto);
          }),
        );
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
    return this.categoryService.findOne(id).pipe(
      switchMap(category => {
        if (!category) {
          return throwError(
            () => new NotFoundException(`Category ${id} not found`),
          );
        }
        return this.categoryService.remove(id).pipe(
          switchMap(() => {
            if (category.imgUrl)
              return this.uploadService.removeFile(category.imgUrl);
            return of(null);
          }),
        );
      }),
      catchError(err =>
        throwError(() => new InternalServerErrorException(err)),
      ),
    );
  }
}
