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
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UserWithEmailDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { catchError, mergeMap, switchMap, throwError } from 'rxjs';
import { Address } from 'src/schemas/user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    return this.userService.findOneByQuery(query);
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
