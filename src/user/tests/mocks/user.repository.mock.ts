import { RegisterUserDto } from '../../dtos/register-user.dto';
import { UserEntity } from '../../entities/user.entity';

export const userRepositoryMock = (storage: Partial<UserEntity>[]) => {
  return () => ({
    createUser: jest.fn().mockImplementation((dto: RegisterUserDto) => {
      storage.push(dto);
    }),
  });
};
