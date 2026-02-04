import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { UserService } from '@/user/user.service';
import { AuthDto } from '@/auth/dto/auth.dto';

@Injectable()
export class EmailService implements OnModuleInit {
    private transporter: Transporter;
    private readonly OTP_TTL: number = 60 * 1000 * 5; // 5 minutes expirty

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) { }


    onModuleInit() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('NODEMAILER_HOST'),
            port: this.configService.get<number>('NODEMAILER_PORT'),
            secure: false,
            auth: {
                user: this.configService.get<string>('NODEMAILER_EMAIL'),
                pass: this.configService.get<string>('NODEMAILER_PASSWORD'),
            },
        });
    }



    async verifyOtp(authDto: AuthDto, otpCode: number) {
        const cachedOTP = await this.cacheManager.get<number>(`otp:${authDto.email}`);
        if (!cachedOTP) throw new BadRequestException('OTP expired');
        if (cachedOTP !== otpCode) throw new BadRequestException('OTP invalid');
        await this.cacheManager.del(`otp:${authDto.email}`);
    }

    async deleteOTP(email: string): Promise<void> {
        await this.cacheManager.del(`otp:${email}`);
    }

    private generateOtp(): number {
        return Math.floor(100000 + Math.random() * 900000);
    }

    async sendOTP(email: string) {
        const user = await this.userService.findUserByEmail(email);
        if (user) {
            throw new ConflictException({
                code: 'USER_ALREADY_EXISTS',
                message: 'A user with this email already exists',
            });
        }

        const otp = this.generateOtp();
        await this.cacheManager.set(`otp:${email}`, otp, this.OTP_TTL);

        try {
            await this.transporter.sendMail({
                from: this.configService.get<string>('NODEMAILER_EMAIL'),
                to: email,
                subject: 'Email Verification - OTP Code',
                html: this.getEmailTemplate(otp),
            });
        } catch (err) {
            await this.cacheManager.del(`otp:${email}`);
            throw new InternalServerErrorException('Failed to send email');
        }
    }

    private getEmailTemplate(OTP_CODE: number): string {
        return `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
            <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:8px;">
                <h2 style="text-align:center; color:#333;">
                    Email Verification
                </h2>
                <p style="color:#555; font-size:15px;">
                    Hello,
                </p>
                <p style="color:#555; font-size:15px;">
                    Use the OTP below to verify your email address.
                </p>
                <div style="text-align:center; margin:30px 0;">
                    <span style="
                        display:inline-block;
                        background:#2d89ef;
                        color:#ffffff;
                        font-size:26px;
                        letter-spacing:5px;
                        padding:12px 30px;
                        border-radius:6px;
                        font-weight:bold;
                    ">
                        ${OTP_CODE}  
                    </span>
                </div>
                <p style="color:#555; font-size:14px;">
                    This code will expire in <strong>5 minutes</strong>.
                </p>
                <p style="color:#999; font-size:13px;">
                    If you did not request this code, you can safely ignore this email.
                </p>
                <hr style="border:none; border-top:1px solid #eee; margin:25px 0;" />
                <p style="color:#aaa; font-size:12px; text-align:center;">
                    © 2025 Prince I. Sestoso
                </p>
            </div>
        </div>
        `;
    }
}