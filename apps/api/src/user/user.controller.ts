import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @ApiOperation({ summary: 'Find user by email' })
  @ApiResponse({ status: 200, description: 'Return an existing user' })
  @Post('findUser')
  async findUserByEmail(@Body() email: string) {
    return await this.userService.findUserByEmail(email);
  }
}