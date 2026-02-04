import { BadRequestException, Body, Controller, Post, UseGuards, Request, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local.guard";
import { JwtAuthGuard } from "./guards/jwt.guard";
import type { AuthJwtPayload } from "./types/auth-jwtPayload";
import { TokenService } from "./tokens/token.service";
import { ApiBody, ApiResponse } from "@nestjs/swagger";
import { Prisma } from "generated/prisma/browser";
import { RefreshTokenGuard } from "./guards/refresh.guard";
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authService: AuthService
  ) { }


  @ApiBody({ type: AuthDto })
  @Post('signin')
  @ApiResponse({ status: 201, description: "User Successfully Logged-in" })
  @ApiResponse({ status: 400, description: "Incorrect credentials" })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async signin(@Request() req) {
    const res = await this.tokenService.generateTokens(req.user);
    return {
      user: req.user,
      ...res,
      message: 'User Successfully Logged-in',
    };
  }

  @Post('signup')
  @ApiResponse({ status: 201, description: "User Successfully Created" })
  @HttpCode(HttpStatus.OK)
  async signup(@Body() authDto: Prisma.UserCreateInput) {
    this.authService.validateSignup(authDto)
    return {
      message: "User Successfully Created"
    }
  }


  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @ApiResponse({ status: 201, description: "Token Refreshed" })
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Request() req,
  ) {
    const userId = req.user.userId;
    const tokens = await this.tokenService.refreshTokens(userId);
    return {
      ...tokens,
      message: 'Token refreshed successfully',
    };


  }
}