import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { Prisma } from 'generated/prisma/browser';
import { User } from 'generated/prisma/client';
import { hashPassword } from '@/lib/hash';

@Injectable()
export class UserService {

  constructor(
    private readonly db: DatabaseService
  ) { }


  async findUserById(userId: string) {
    return await this.db.user
      .findUnique({ where: { userId: userId } })
      .catch(() => {
        throw new InternalServerErrorException('Failed to find a user.');
      });
  }

  async createUser(dto: Prisma.UserCreateInput): Promise<void> {
    if (!dto.password) throw new BadRequestException()
    const hashedPassword = await hashPassword(dto.password);

    await this.db.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        address: dto.address,
      },
    }).catch(() => {
      throw new InternalServerErrorException('Failed to craete a user.');
    });;
  }


  async findUserByEmail(email: string): Promise<User | null> {
    return this.db.user
      .findUnique({ where: { email: email } })
      .catch(() => {
        throw new InternalServerErrorException('Failed to find a user.');
      });
  }
}