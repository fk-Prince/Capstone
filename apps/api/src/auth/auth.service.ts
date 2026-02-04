import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { comparePassword } from "@/lib/hash";
import { JwtService } from "@nestjs/jwt";
import { AuthDto } from './dto/auth.dto';
import { Prisma } from "generated/prisma/browser";


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(authDto: AuthDto) {
    if (!authDto.password)
      throw new UnauthorizedException('Invalid Credentials.');

    const user = await this.userService.findUserByEmail(authDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials.');
    }

    const isPasswordCorrect = await comparePassword(
      authDto.password,
      user.password ?? '',
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid Credentials.');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateSignup(userDto: Prisma.UserCreateManyInput) {

    const user = await this.userService.findUserByEmail(userDto.email);

    if (user) {
      throw new ConflictException({
        code: 'USER_ALREADY_EXISTS',
        message: 'A user with this email already exists',
      });
    }

    await this.userService.createUser(userDto);

  }

}