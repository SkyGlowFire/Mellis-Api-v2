import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IS_PUBLIC } from "src/auth/public.decorator";
import { Category } from "src/categories/schemas/category.schema";
import { User, UserDocument } from "src/users/schemas/user.schema";
import { UsersService } from "src/users/users.service";
import { Action, AppAbility, CaslAbilityFactory } from "./casl-ability.factory";
import { CHECK_POLICIES } from "./check-policy.decorator";
import { PolicyHandler } from "./types/policyHandler";

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
            context.getHandler(),
            context.getClass()
        ])
    if(isPublic) return true

    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES,
        context.getHandler(),
      ) || [];

    const {user} = context.switchToHttp().getRequest();
    
    if(!user) return false

    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
