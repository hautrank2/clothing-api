import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './modules/category/category.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UploadService } from './services/upload.service';
import { ProductModule } from './modules/product/product.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from './config/validation.pipe';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { AppGuard } from './app.guard';
import configuration from './config/configuration';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configuration],
    }),
    JwtModule.register({
      global: true,
      secret: configuration().jwtSecret,
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL || ''),
    CategoryModule,
    ProductModule,
    UserModule,
    AuthModule,
    CartModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UploadService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: AppGuard,
    },
  ],
  exports: [UploadService],
})
export class AppModule {}
