import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequestWithUser } from '../guards/base-token.guard';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: IRequestWithUser = ctx.switchToHttp().getRequest();
    return req.local?.user;
  },
);
