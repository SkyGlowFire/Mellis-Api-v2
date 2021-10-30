import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {Request} from 'express'
import * as mongoose  from 'mongoose';
import { ACTION_TYPE } from 'src/auth/action-type.decorator';
import { Action, CaslAbilityFactory, User } from "../casl/casl-ability.factory";
import { UsersService } from './users.service';

interface ReqWithUser extends Request{
    user: {_id: mongoose.Types.ObjectId}
}

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private caslAbilityFactory: CaslAbilityFactory,
    private reflector: Reflector,
    private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user, params } = context.switchToHttp().getRequest<ReqWithUser>();
    const userDoc = await this.usersService.get(user?._id)
    const ability = this.caslAbilityFactory.createForUser(userDoc);

    const actionType = this.reflector.get<Action>(ACTION_TYPE, context.getHandler());
    return ability.can(actionType, new User(params.id))
  }
}