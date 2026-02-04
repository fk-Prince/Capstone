import { Module } from "@nestjs/common";
import { TokenService } from "./token.service";
import { UserModule } from "@/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import jwtConfig from "../config/jwt.config";

@Module({
    imports: [UserModule, JwtModule.registerAsync(jwtConfig.asProvider())],
    providers: [TokenService],
    exports: [TokenService],
})
export class TokenModule { }
