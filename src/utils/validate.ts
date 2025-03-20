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
        validate(value: any) {
          console.log(value, options);
          if (!value || typeof value !== 'object') return false; // Kiểm tra tránh lỗi
          const file = value as Express.Multer.File; // Ép kiểu an toàn
          return options?.mime ? options.mime.includes(file.mimetype) : true;
        },
      },
    });
  };
}

export function AtLeastOne(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: { [key: string]: any }, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [fields],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [fields] = args.constraints;
          const obj = args.object as { [key: string]: any };
          if (Array.isArray(fields) && fields.length > 0) {
            return !!fields.some((field: string) => {
              console.log('field', field);
              console.log('value', obj);
              if (typeof obj === 'string' && typeof obj[field] === 'string') {
                return obj[field] && String(obj[field]).trim().length > 0;
              }
              return !!(obj as { [key: string]: any })[field];
            });
          }
          return false;
        },
      },
    });
  };
}
