import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const NotNullableString = (example: string) => {
  return applyDecorators(
    IsString(),
    IsNotEmpty(),
    ApiProperty({
      example,
    }),
  );
};
