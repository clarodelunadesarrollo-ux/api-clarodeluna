import {
    refreshTokenSchema,
    requestOtpSchema,
    verifyOtpSchema,
    type AuthResponse,
    type RefreshTokenDto,
    type RequestOtpDto,
    type VerifyOtpDto,
} from '@claro-de-luna/shared';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async requestOtp(
    @Body(new ZodValidationPipe(requestOtpSchema)) body: RequestOtpDto,
  ): Promise<{ message: string; devCode?: string }> {
    const code = await this.authService.requestOtp(body.email);
    const response: { message: string; devCode?: string } = {
      message: 'Si el correo es válido, enviamos un código de acceso.',
    };
    // Expose the code outside production, or when explicitly opted in via
    // OTP_EXPOSE_CODE (closed demos without email delivery), so the app auto-fills it.
    const exposeCode =
      this.config.get<string>('NODE_ENV') !== 'production' ||
      this.config.get<boolean>('OTP_EXPOSE_CODE') === true;
    if (exposeCode) {
      response.devCode = code;
    }
    return response;
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  verifyOtp(
    @Body(new ZodValidationPipe(verifyOtpSchema)) body: VerifyOtpDto,
  ): Promise<AuthResponse> {
    return this.authService.verifyOtp(body.email, body.code);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenDto,
  ): Promise<AuthResponse> {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenDto,
  ): Promise<void> {
    await this.authService.logout(body.refreshToken);
  }
}
