import {Injectable, ExecutionContext} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook'){

    getAuthenticateOptions(ctx: ExecutionContext){
        const req = ctx.switchToHttp().getRequest()
        const {from} = req.query
        const state = `from=${from}`
        return {state}
    }
}