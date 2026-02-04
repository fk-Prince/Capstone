import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh-jwt') {

    canActivate(context: ExecutionContext) {
        console.log('RefreshTokenGuard yawa');
        return super.canActivate(context);
    }

}
