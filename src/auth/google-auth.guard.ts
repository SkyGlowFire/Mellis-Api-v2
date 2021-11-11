import {Injectable, ExecutionContext} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google'){
     async canActivate(ctx: ExecutionContext){
        const result = (await super.canActivate(ctx)) as boolean
        const req = ctx.switchToHttp().getRequest()
        await super.logIn(req)
        return result
    }

    getAuthenticateOptions(ctx: ExecutionContext){
        const req = ctx.switchToHttp().getRequest()
        const {from} = req.query
        const state = `from=${from}`
        return {state}
    }
}