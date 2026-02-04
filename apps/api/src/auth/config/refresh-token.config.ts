import { registerAs } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";



export default registerAs("refresh-jwt", (): JwtModuleOptions => ({
    secret: process.env.JWT_REFRESH_KEY!,
    signOptions: {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN! as any
    }
}))