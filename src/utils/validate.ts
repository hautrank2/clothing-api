import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

interface IsFileOptions {
  mime: string[];
}

export function IsFile(
  options: IsFileOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: { [key: string]: any }, propertyName: string) {
    return registerDecorator({
      name: 'isFile',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || typeof value !== 'object') return false; // Kiểm tra tránh lỗi
          const file = value as Express.Multer.File; // Ép kiểu an toàn
          return options?.mime ? options.mime.includes(file.mimetype) : true;
        },
      },
    });
  };
}
