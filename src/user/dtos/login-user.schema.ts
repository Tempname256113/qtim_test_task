import { ApiProperty } from '@nestjs/swagger';

export class LoginUserSchema {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVtcG5hbWUyNTYxMTMiLCJpYXQiOjE3Mjc0NTQwODksImV4cCI6MTcyNzQ1NDk4OX0.kvzaW5IC2A6_yeJAgO5c6byn0m74IpbVLpMY0hDar_s',
  })
  accessToken: string;
}
