import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACTION_TYPE } from 'src/auth/action-type.decorator';
import { Action, CaslAbilityFactory } from "../casl/casl-ability.factory";
import { plainToClass } from 'class-transformer';
import {User} from 'src/casl/entities'
import { ReqWithUser } from 'src/auth/types/reqWithUser';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private caslAbilityFactory: CaslAbilityFactory,
    private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user} = context.switchToHttp().getRequest<ReqWithUser>();
    const userInstance = plainToClass(User, user.toObject())
    console.log('user instance', userInstance)
    const ability = this.caslAbilityFactory.createForUser(userInstance);
    const actionType = this.reflector.get<Action>(ACTION_TYPE, context.getHandler());
    return ability.can(actionType, userInstance)
  }
}