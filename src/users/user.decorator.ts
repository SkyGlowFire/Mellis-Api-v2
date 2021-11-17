import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ReqWithUser } from 'src/auth/types/reqWithUser';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ReqWithUser | Request>();
    const user = request.user
    return data ? user?.[data] : user;
  },
);