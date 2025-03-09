import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { catchError, mergeMap, throwError } from 'rxjs';
import { UploadService } from 'src/services/upload.service';
import { CategoryService } from '../category/category.service';
import { Category } from 'src/schemas/category.schema';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private uploadService: UploadService,
    private categorService: CategoryService,
  ) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    // Check valid code
    // Create product without image
    // After create product successfully, Upload allimgUrls and assign to color
    const colors = dto.colors;
    dto.colors = colors.map(e => ({
      ...e,
      imgUrls: [],
    }));
    return this.productService.codeIsExist(dto.code).pipe(
      mergeMap(codeIsExist =>
        codeIsExist
          ? throwError(() => new BadRequestException('Code already exists'))
          : this.productService.create(dto),
      ),
      catchError(err =>
        throwError(() => new InternalServerErrorException(err)),
      ),
    );
  }

  @Get()
  findAll(@Query('page') page: number, @Query('pageSize') pageSize: number) {
    return this.productService.findAll(+page, +pageSize);
  }

  @Get('/categoryCode/:categoryCode')
  findByCategoryCode(@Param('categoryCode') code: string) {
    console.log('findByCategoryCode');
    return this.categorService.findByCode(code).pipe(
      mergeMap((categories: Category[] | []) => {
        if (
          !Array.isArray(categories) ||
          !categories.length ||
          !categories[0]
        ) {
          return throwError(
            () => new NotFoundException('Category with this code not found'),
          );
        }
        const cate = categories[0];
        if (!cate._id) {
          return throwError(
            () => new NotFoundException('Category with this code not found'),
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return this.productService.findAll(1, 100, cate._id.toString());
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('findById');
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
