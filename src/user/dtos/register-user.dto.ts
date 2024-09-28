import { NotNullableString } from '../../decorators/not-nullable-string.decorator';

export class RegisterUserDto {
  @NotNullableString('tempname256113')
  username: string;

  @NotNullableString('p4$$w0rd')
  password: string;
}
