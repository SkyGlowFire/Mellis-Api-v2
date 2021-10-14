import {CanActivate, Injectable, ExecutionContext} from '@nestjs/common'
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from './public.decorator';

@Injectable()
export class AuthenticatedGuard implements CanActivate{
    constructor(private reflector: Reflector){}

    async canActivate(ctx: ExecutionContext){
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
            ctx.getHandler(),
            ctx.getClass()
        ])
        
        if(isPublic) return true

        const req = ctx.switchToHttp().getRequest()
        const result =  req.isAuthenticated()
        return result
    }
}