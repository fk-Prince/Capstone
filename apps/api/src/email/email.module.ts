import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@/user/user.module';

@Module({
    imports: [UserModule, ConfigModule, CacheModule.register({ isGlobal: true })],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule { }