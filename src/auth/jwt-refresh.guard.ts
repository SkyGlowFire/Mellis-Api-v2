import {ExecutionContext, Injectable} from '@nestjs/common'
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC } from './public.decorator';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh'){
    constructor(private reflector: Reflector){
        super()
    }

    canActivate(ctx: ExecutionContext){
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
            ctx.getHandler(),
            ctx.getClass()
        ])
        
        if(isPublic) return true
        
        return super.canActivate(ctx)
    }
}