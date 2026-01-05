import { Injectable } from '@nestjs/common';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductVariant } from 'src/schemas/product-variant.schema';
import { Product } from 'src/schemas/product.schema';
import { from, map, Observable } from 'rxjs';

@Injectable()
export class ProductVariantService {
  constructor(
    @InjectModel(ProductVariant.name)
    private prodVarModel: Model<ProductVariant>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  create(
    createProductVariantDto: CreateProductVariantDto,
  ): Observable<ProductVariant> {
    const prodVar = new this.prodVarModel(createProductVariantDto);
    return from(prodVar.save());
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
