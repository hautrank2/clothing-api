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

  findOne(id: number) {
    return `This action returns a #${id} productVariant`;
  }

  update(id: number, updateProductVariantDto: UpdateProductVariantDto) {
    return `This action updates a #${id} productVariant`;
  }

  remove(id: number) {
    return `This action removes a #${id} productVariant`;
  }

  findByProductId(productId: string): Observable<ProductVariant[]> {
    const prodVars = this.prodVarModel.find({ productId }).lean().exec();
    return from(prodVars);
  }
}
