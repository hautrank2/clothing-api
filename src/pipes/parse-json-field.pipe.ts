import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseJsonFieldPipe implements PipeTransform {
  constructor(private readonly fields: string[]) {}

  transform(value: any) {
    for (const field of this.fields) {
      if (typeof value?.[field] === 'string') {
        try {
          value[field] = JSON.parse(value[field]);
        } catch {
          throw new BadRequestException(`${field} must be valid JSON`);
        }
      }
    }
    return value;
  }
}
