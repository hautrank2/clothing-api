import { Injectable } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductVariant } from 'src/schemas/product-variant.schema';
import { Product } from 'src/schemas/product.schema';
import {
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';
import { UploadService } from 'src/services/upload.service';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectModel(ProductVariant.name)
    private prodVarModel: Model<ProductVariant>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private uploadService: UploadService,
  ) {}

  create(
    createProductVariantDto: CreateProductVariantDto,
    files: Array<Express.Multer.File>,
  ): Observable<ProductVariant> {
    if (!files || files.length === 0) {
      const prodVar = new this.prodVarModel({
        ...createProductVariantDto,
        imgUrls: [],
      });
      return from(prodVar.save());
    }

    const upload$ = files.map(file =>
      this.uploadService.uploadFile(
        file,
        ['clothes', 'product'],
        file.filename,
      ),
    );

    return forkJoin(upload$).pipe(
      switchMap((imgUrls: string[]) => {
        const prodVar = new this.prodVarModel({
          ...createProductVariantDto,
          imgUrls,
        });

        return from(prodVar.save()).pipe(
          catchError(err => {
            // 🔥 rollback image if fail
            return forkJoin(
              imgUrls.map(url => this.uploadService.removeFile(url)),
            ).pipe(switchMap(() => throwError(() => err as string)));
          }),
        );
      }),
    );
  }

  createMultiple(
    createProductVariantDtos: CreateProductVariantDto[],
  ): Observable<ProductVariant[]> {
    return from(this.prodVarModel.insertMany(createProductVariantDtos)).pipe(
      map(docs => docs.map(doc => doc.toObject())),
    );
  }

  findAll() {
    return `This action returns all productVariant`;
  }

  findOne(id: string) {
    return from(this.prodVarModel.findById(id).exec());
  }

  update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    return from(
      this.prodVarModel.findByIdAndUpdate(id, updateProductVariantDto, {
        new: true,
      }),
    );
  }

  remove(id: number) {
    return `This action removes a #${id} productVariant`;
  }

  findByProductId(productId: string): Observable<ProductVariant[]> {
    const prodVars = this.prodVarModel.find({ productId }).exec();
    return from(prodVars);
  }

  addImages(
    variantId: string,
    files: Array<Express.Multer.File>,
  ): Observable<ProductVariant | null> {
    const upload$ = files.map(file =>
      this.uploadService.uploadFile(
        file,
        ['clothes', 'product'],
        file.filename,
      ),
    );
    return forkJoin(upload$).pipe(
      switchMap((imgUrls: string[]) =>
        from(
          this.prodVarModel.findByIdAndUpdate(
            variantId,
            { $push: { imgUrls: { $each: imgUrls } } },
            { new: true },
          ),
        ).pipe(
          catchError(() => {
            const remove$ = imgUrls.map(imgUrl =>
              this.uploadService.removeFile(imgUrl),
            );
            return from(remove$).pipe(map(() => null));
          }),
        ),
      ),
    );
  }

  removeImage(
    variantId: string,
    index: number,
  ): Observable<ProductVariant | null> {
    return this.findOne(variantId).pipe(
      switchMap(prodVar => {
        if (!prodVar) {
          return throwError(() => new Error('Product variant not found'));
        }

        const findImg = prodVar.imgUrls[index];
        if (!findImg) {
          return throwError(() => new Error('Image not found'));
        }

        const remove$ = this.uploadService.removeFile(findImg);
        return from(remove$).pipe(
          mergeMap(() => {
            prodVar.imgUrls.splice(index, 1);
            return from(
              this.prodVarModel.findByIdAndUpdate(
                variantId,
                { imgUrls: prodVar.imgUrls },
                { new: true },
              ),
            );
          }),
        );
      }),
    );
  }
}
