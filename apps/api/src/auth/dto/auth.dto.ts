import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { Prisma } from 'generated/prisma/browser';

export class AuthDto implements Pick<Prisma.UserCreateInput, 'email'> {
    @IsEmail()
    @ApiProperty({ example: 'john@example.com' })
    @IsNotEmpty({ message: 'Email is required.' })
    email: string;

    @IsString()
    @ApiProperty({ example: 'StrongP@ssw0rd' })
    @IsNotEmpty({ message: 'Password is required.' })
    password: string;
}