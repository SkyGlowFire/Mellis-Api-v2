import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC } from "src/auth/public.decorator";
import { AppAbility, CaslAbilityFactory } from "./casl-ability.factory";
import { CHECK_POLICIES } from "./check-policy.decorator";
import { PolicyHandler } from "./types/policyHandler";
import { ReqWithUser } from "src/auth/types/reqWithUser";
import { plainToClass } from 'class-transformer';
import {User} from 'src/casl/entities'

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

    const {user} = context.switchToHttp().getRequest<ReqWithUser>();
    if(!user) return false

    const userInstance = plainToClass(User, user.toObject())
    const ability = this.caslAbilityFactory.createForUser(userInstance);

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
