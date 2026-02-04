import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthJwtPayload } from "../types/auth-jwtPayload";
import { UserService } from "@/user/user.service";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class TokenService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService) { }

    async generateTokens(id: string) {
        const payload: AuthJwtPayload = { userId: id };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET_KEY!,
                expiresIn: process.env.JWT_SECRET_EXPIRES_IN! as any
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_KEY!,
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN! as any
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }


    async refreshTokens(userId: string) {
        if (!userId) {
            throw new UnauthorizedException('Invalid user ID');
        }

        const user = await this.userService.findUserById(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const { password, ...userWithoutPassword } = user;

        return this.generateTokens(userWithoutPassword.userId);
    }

}
