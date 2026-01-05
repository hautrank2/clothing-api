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
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { catchError, map, mergeMap, of, throwError } from 'rxjs';
import { CategoryService } from '../category/category.service';
import { Category } from 'src/schemas/category.schema';
import { AdminGuard } from 'src/guards/admin.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductVariantService } from '../product-variant/product-variant.service';
import { CreateProductVariantDto } from '../product-variant/dto/create-product-variant.dto';

@UseGuards(AdminGuard)
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categorService: CategoryService,
    private readonly prodVarService: ProductVariantService,
  ) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
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
  findAll(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productService.findAll(+page, +pageSize, { categoryId });
  }

  @Get('/categoryCode/:categoryCode')
  findByCategoryCode(@Param('categoryCode') code: string) {
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
        return this.productService.findAll(1, 100, {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          categoryId: cate._id.toString(),
        });
      }),
    );
  }

  @Get(':id/variants')
  findVariants(@Param('id') id: string) {
    return this.productService.findOne(id).pipe(
      mergeMap(prod => {
        if (!prod) {
          return throwError(() => new NotFoundException('Product not found'));
        }
        return this.prodVarService.findByProductId(id);
      }),
    );
  }

  @Post(':id/variants')
  createVariants(
    @Param('id') id: string,
    @Body() productVariants: CreateProductVariantDto[],
  ) {
    return this.productService.findOne(id).pipe(
      mergeMap(prod => {
        if (!prod) {
          return throwError(() => new NotFoundException('Product not found'));
        }
        return this.prodVarService.findByProductId(id);
      }),
    );
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.productService.findByCode(code).pipe(
      mergeMap(e => {
        if (e.length === 0)
          return throwError(() => new NotFoundException('Product not found'));
        return of(e);
      }),
      map(e => e[0]),
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
