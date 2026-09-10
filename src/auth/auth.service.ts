import type { AuthResponse, AuthTokens, User } from '@claro-de-luna/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_ATTEMPTS = 5;
const HASH_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
    private readonly users: UsersService,
  ) {}

  /**
   * Always returns a generic result to avoid leaking whether an email exists.
   * Returns the plaintext code so the controller can expose it in non-production only.
   */
  async requestOtp(email: string): Promise<string> {
    const code = randomInt(100_000, 1_000_000).toString();
    const codeHash = await bcrypt.hash(code, HASH_ROUNDS);

    // Keep a single active code per email.
    await this.prisma.otpCode.deleteMany({ where: { email, consumedAt: null } });
    await this.prisma.otpCode.create({
      data: { email, codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    });

    await this.mail.sendOtpCode(email, code);
    return code;
  }

  async verifyOtp(email: string, code: string): Promise<AuthResponse> {
    const otp = await this.prisma.otpCode.findFirst({
      where: { email, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.attempts >= OTP_MAX_ATTEMPTS) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    const matches = await bcrypt.compare(code, otp.codeHash);
    if (!matches) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid or expired code');
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    const user = await this.users.findOrCreateByEmail(email);
    const tokens = await this.issueTokens(user);
    return { ...tokens, user };
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const stored = await this.findMatchingRefreshToken(payload.sub, refreshToken);
    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate: revoke the used token and issue a fresh pair.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.users.findById(payload.sub);
    const tokens = await this.issueTokens(user);
    return { ...tokens, user };
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = await this.verifyRefreshToken(refreshToken).catch(() => null);
    if (!payload) {
      return;
    }
    const stored = await this.findMatchingRefreshToken(payload.sub, refreshToken);
    if (stored) {
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_TTL') as JwtSignOptions['expiresIn'],
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_TTL') as JwtSignOptions['expiresIn'],
      },
    );

    const decoded = this.jwt.decode(refreshToken) as { exp: number };
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, HASH_ROUNDS),
        expiresAt: new Date(decoded.exp * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(token: string): Promise<{ sub: string }> {
    try {
      return await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async findMatchingRefreshToken(userId: string, token: string) {
    const candidates = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    for (const candidate of candidates) {
      if (await bcrypt.compare(token, candidate.tokenHash)) {
        return candidate;
      }
    }
    return null;
  }
}
