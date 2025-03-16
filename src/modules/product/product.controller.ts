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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  catchError,
  map,
  merge,
  mergeMap,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { CategoryService } from '../category/category.service';
import { Category } from 'src/schemas/category.schema';
import { Product } from 'src/schemas/product.schema';
import { UploadService } from 'src/services/upload.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private categorService: CategoryService,
    private uploadService: UploadService,
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
    const imgRemoves: { color: string; imgUrl: string }[] = [];
    return this.productService.remove(id).pipe(
      mergeMap((product: Product) => {
        if (!product) {
          return throwError(() => new NotFoundException('Product not found'));
        }
        const removeImgUrlsObs = product.colors
          .map(color => {
            return color.imgUrls.map(imgUrl => {
              return (
                imgUrl &&
                this.uploadService.removeFile(imgUrl).pipe(
                  catchError(() => {
                    imgRemoves.push({
                      color: color.color,
                      imgUrl: imgUrl,
                    });
                    return of(null);
                  }),
                )
              );
            });
          })
          .flat(Infinity)
          .filter(e => e);
        return merge(removeImgUrlsObs).pipe(
          tap(() => {
            console.log(
              'Remove complete, Image removed failed',
              JSON.stringify(imgRemoves),
            );
          }),
        );
      }),
      map(res => {
        console.log('map', res);
        return of(res);
      }),
    );
  }

  @Post(':id/uploadImg')
  @UseInterceptors(FileInterceptor('image'))
  uploadImg(
    @Param('id') id: string,
    @Query('colorIndex') colorIndex: number,
    @Query('imgIndex') imgIndex: number,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image)
      return throwError(() => new BadRequestException('Image not received'));
    return this.productService.findOne(id).pipe(
      switchMap((product: Product) => {
        if (!product)
          return throwError(() => new NotFoundException('Product not found'));
        return this.uploadService
          .uploadFile(
            image,
            ['clothes', 'product'],
            `${product.code}_${imgIndex}`,
          )
          .pipe(
            mergeMap(uploadImg => {
              // if success
              // Check if exist image => remove this
              const oldImgUrl = product.colors[colorIndex].imgUrls[imgIndex];
              const removeImgObs = oldImgUrl
                ? this.uploadService.removeFile(oldImgUrl)
                : of("Don't remove file");

              return removeImgObs.pipe(
                switchMap(() => {
                  //Update new image for product
                  return this.productService.updateByQuery(id, {
                    $set: {
                      [`colors.${colorIndex}.imgUrls.${imgIndex}`]: uploadImg,
                    },
                  });
                }),
              );
            }),
          );
      }),
      catchError(err =>
        throwError(() => new InternalServerErrorException(err)),
      ),
    );
  }
}
