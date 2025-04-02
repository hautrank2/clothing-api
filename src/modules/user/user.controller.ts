import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  InternalServerErrorException,
  Query,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserWithEmailDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import {
  catchError,
  mergeMap,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { Item } from 'src/schemas/item.schema';
import { CartService } from '../cart/cart.service';
import { Address, User } from 'src/schemas/user.schema';
import { Cart } from 'src/schemas/cart.schema';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cartService: CartService,
  ) {}

  @Post('createWithEmail')
  createWithEmail(@Body() dto: UserWithEmailDto) {
    return this.userService.findOneByQuery(dto).pipe(
      mergeMap(user => {
        if (user)
          return throwError(
            () => new BadRequestException('Email already exists'),
          );
        return this.userService.createWithEmail(dto);
      }),
    );
  }

  @Post('/addItem/:userId')
  addItem(
    @Body() item: Item,
    @Param('userId') userId: string,
  ): Observable<Cart | null> {
    return this.userService.findOne(userId).pipe(
      mergeMap((user: User | null) => {
        if (!user) {
          return throwError(() => new NotFoundException('User not found'));
        }
        return this.cartService.addItem(item, userId);
      }),
    );
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    return this.userService.findOneByQuery({ email: createUserDto.email }).pipe(
      // Check email exist
      mergeMap(user => {
        if (user)
          return throwError(
            () => new BadRequestException('Email already exists'),
          );
        // Check username exist
        return this.userService
          .findOneByQuery({
            username: createUserDto.username,
          })
          .pipe(
            switchMap(user => {
              if (user)
                return throwError(
                  () => new BadRequestException('Username already exists'),
                );
              return this.userService.create(createUserDto);
            }),
          );
      }),
      catchError(err =>
        throwError(() => new InternalServerErrorException(err)),
      ),
    );
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('filter')
  findByFilter(@Query() query: { [key: string]: string }) {
    console.log('query', query);
    return this.userService.findOneByQuery(query);
  }

  @Get('/cart/:id')
  findCart(@Param('id') id: string) {
    return this.cartService.findByUserId(id).pipe(
      mergeMap(cart => {
        if (!cart) {
          return throwError(() => new BadRequestException('Cart not found'));
        }
        return of(cart);
      }),
    );
  }

  @Put('/:id/address')
  updateAddress(@Param('id') id: string, @Body() dto: Address[]) {
    return this.userService.updateAddress(id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
