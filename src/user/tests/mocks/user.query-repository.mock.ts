import { UserEntity } from '../../entities/user.entity';

export const userQueryRepositoryMock = (storage: Partial<UserEntity>[]) => {
  return () => ({
    getUserByUsername: jest.fn().mockImplementation((username: string) => {
      return storage.find((user) => user.username === username);
    }),
  });
};
