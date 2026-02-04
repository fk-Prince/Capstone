import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { AuthJwtPayload } from "../types/auth-jwtPayload";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "refresh-jwt") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_REFRESH_KEY!,
        });
    }

    async validate(payload: AuthJwtPayload) {
        return payload.userId;
    }
}
