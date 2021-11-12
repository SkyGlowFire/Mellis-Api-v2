import {Injectable, ExecutionContext} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google'){

    getAuthenticateOptions(ctx: ExecutionContext){
        const req = ctx.switchToHttp().getRequest()
        const {from} = req.query
        const state = `from=${from}`
        return {state}
    }
}